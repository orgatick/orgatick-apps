import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NewsletterTokenPayload, NewsletterTokenPurpose } from "../types/newsletter.types";

const TOKEN_VERSION = "v1";

/**
 * Issues and verifies the self-service tokens used by confirm / unsubscribe /
 * preference links.
 *
 * A token is `<base64url(payload)>.<base64url(hmac)>`. It is stateless (no lookup
 * needed to validate the signature) while still carrying a purpose, so a
 * confirmation link can never be replayed as an unsubscribe. Only the SHA-256 of
 * the token is persisted, so a database dump cannot be used to unsubscribe people.
 */
@Injectable()
export class NewsletterTokenService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret =
      configService.get<string>("NEWSLETTER_TOKEN_SECRET") ?? configService.getOrThrow<string>("JWT_SECRET");
  }

  createToken(payload: NewsletterTokenPayload): string {
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    return `${encoded}.${this.sign(encoded)}`;
  }

  createConfirmationToken(subscriberUuid: string, ttlMinutes: number): string {
    return this.createToken({
      purpose: "confirm",
      subscriberUuid,
      expiresAt: Math.floor(Date.now() / 1000) + ttlMinutes * 60,
    });
  }

  /** Manage/unsubscribe tokens do not expire: a footer link must keep working years later. */
  createManageToken(subscriberUuid: string, purpose: NewsletterTokenPurpose = "manage"): string {
    return this.createToken({ purpose, subscriberUuid });
  }

  createUnsubscribeToken(subscriberUuid: string): string {
    return this.createManageToken(subscriberUuid, "unsubscribe");
  }

  verifyToken(token: string, expectedPurpose: NewsletterTokenPurpose): NewsletterTokenPayload {
    if (!token || typeof token !== "string") {
      throw new BadRequestException("Missing token");
    }

    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) {
      throw new BadRequestException("Malformed token");
    }

    const expected = this.sign(encoded);
    const providedBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expected, "base64url");

    if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
      throw new BadRequestException("Invalid or tampered token");
    }

    let payload: NewsletterTokenPayload;
    try {
      payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as NewsletterTokenPayload;
    } catch {
      throw new BadRequestException("Malformed token");
    }

    if (payload.purpose !== expectedPurpose) {
      throw new BadRequestException("Token is not valid for this action");
    }

    if (payload.expiresAt && payload.expiresAt * 1000 < Date.now()) {
      throw new BadRequestException("Token has expired");
    }

    return payload;
  }

  /** Opaque random token used where a signature adds nothing (e.g. one-click unsubscribe keys). */
  createOpaqueToken(): string {
    return randomBytes(32).toString("base64url");
  }

  hashToken(token: string): string {
    return createHmac("sha256", this.secret).update(`hash:${token}`).digest("hex");
  }

  private sign(value: string): string {
    return createHmac("sha256", this.secret).update(`${TOKEN_VERSION}:${value}`).digest("base64url");
  }
}
