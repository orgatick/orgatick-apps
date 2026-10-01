import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  SubscribeNewsletterSchema,
  type ManageSubscriptionResponse,
  type SubscribeNewsletterDto,
  type SubscribeNewsletterResponse,
  type UnsubscribeNewsletterResponse,
  UpdateNewsletterPreferencesSchema,
  type UpdateNewsletterPreferencesDto,
} from "@orgatick/contracts";
import { Public } from "../../../common/decorators/public.decorator";
import { RateLimit } from "../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { NEWSLETTER_RATE_LIMIT_POLICIES } from "../../../infrastructure/rate-limit/constants/policies/newsletter.policy";
import { NEWSLETTER_OPEN_PIXEL_BASE64 } from "../constants/newsletter.constants";
import { NewsletterSubscriberService } from "../services/newsletter-subscriber.service";
import { NewsletterTrackingService } from "../services/newsletter-tracking.service";

/** Only these schemes may be used as a click-redirect target. */
const REDIRECT_ALLOWLIST = /^(https?:\/\/)/i;

/**
 * Public newsletter surface: subscription, self-service management, tracking pixels and
 * the provider webhook. Everything here is unauthenticated, so every handler is rate
 * limited and token-scoped.
 */
@Public()
@Controller("newsletter")
export class NewsletterPublicController {
  constructor(
    private readonly subscriberService: NewsletterSubscriberService,
    private readonly trackingService: NewsletterTrackingService,
  ) {}

  @Post("subscribe")
  @RateLimit([NEWSLETTER_RATE_LIMIT_POLICIES.subscribe, NEWSLETTER_RATE_LIMIT_POLICIES.subscribeAccount])
  @HttpCode(200)
  async subscribe(
    @Body({ schema: SubscribeNewsletterSchema }) dto: SubscribeNewsletterDto,
    @Req() request: Request,
  ): Promise<SubscribeNewsletterResponse> {
    return await this.subscriberService.subscribe(dto, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  /** Double opt-in landing endpoint. Returns JSON so the client app can render the result. */
  @Get("confirm")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.confirm)
  async confirm(@Query("token") token: string): Promise<SubscribeNewsletterResponse> {
    if (!token) {
      throw new NotFoundException("Missing confirmation token");
    }
    return await this.subscriberService.confirm(token);
  }

  @Get("unsubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async unsubscribe(@Query("token") token: string): Promise<UnsubscribeNewsletterResponse> {
    if (!token) {
      throw new NotFoundException("Missing unsubscribe token");
    }
    return await this.subscriberService.unsubscribe(token);
  }

  /**
   * RFC 8058 one-click endpoint.
   *
   * Mail clients POST here straight from the `List-Unsubscribe` header, so it must accept
   * an empty body and answer 200 for an already-unsubscribed address.
   */
  @Post("unsubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async oneClickUnsubscribe(@Body("List-Unsubscribe") payload: string, @Query("token") token: string) {
    if (!token && payload !== "List-Unsubscribe=One-Click") {
      throw new NotFoundException("Missing unsubscribe token");
    }

    await this.trackingService.oneClickUnsubscribe(token);
    return { message: "Unsubscribed" };
  }

  @Get("preferences")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async preferences(@Query("token") token: string): Promise<ManageSubscriptionResponse> {
    if (!token) {
      throw new NotFoundException("Missing preferences token");
    }
    return await this.trackingService.getPreferences(token);
  }

  @Post("preferences")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async updatePreferences(
    @Query("token") token: string,
    @Body({ schema: UpdateNewsletterPreferencesSchema }) dto: UpdateNewsletterPreferencesDto,
  ): Promise<ManageSubscriptionResponse> {
    if (!token) {
      throw new NotFoundException("Missing preferences token");
    }
    return await this.trackingService.updatePreferences(token, dto);
  }

  @Post("resubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async resubscribe(@Query("token") token: string): Promise<SubscribeNewsletterResponse> {
    if (!token) {
      throw new NotFoundException("Missing manage token");
    }
    return await this.subscriberService.resubscribe(token);
  }

  /**
   * Open-tracking pixel.
   *
   * Always answers with the 1x1 GIF, even for an unknown recipient, so a probe cannot tell
   * whether an address is on a list.
   */
  @Get("track/open/:recipientId")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async trackOpen(@Param("recipientId") recipientId: string, @Req() request: Request, @Res() response: Response) {
    await this.safely(() =>
      this.trackingService.recordOpen(recipientIdParam(recipientId), {
        ipAddress: request.ip,
        userAgent: request.get("user-agent"),
      }),
    );

    response.setHeader("Content-Type", "image/gif");
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.setHeader("Content-Length", String(Buffer.from(NEWSLETTER_OPEN_PIXEL_BASE64, "base64").length));
    response.end(Buffer.from(NEWSLETTER_OPEN_PIXEL_BASE64, "base64"));
  }

  /** Click-tracking redirect. */
  @Get("track/click/:recipientId")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async trackClick(
    @Param("recipientId") recipientId: string,
    @Query("url") url: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const target = isAllowedRedirect(url) ? url : "/";

    await this.safely(() =>
      this.trackingService.recordClick(recipientIdParam(recipientId), target, {
        ipAddress: request.ip,
        userAgent: request.get("user-agent"),
      }),
    );

    response.setHeader("Cache-Control", "no-store");
    response.redirect(302, target);
  }

  /**
   * Provider deliverability webhook.
   *
   * The raw body is needed to verify the signature, so it is read here rather than parsed
   * by the global validation pipe.
   */
  @Post("webhooks/deliverability")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async deliverabilityWebhook(@Req() request: Request) {
    const rawBody = readRawBody(request);

    const signature =
      request.get("svix-signature") ?? request.get("x-resend-signature") ?? request.get("x-signature") ?? undefined;

    return await this.trackingService.handleWebhook(rawBody, signature);
  }

  private async safely(work: () => Promise<void>): Promise<void> {
    try {
      await work();
    } catch {
      // Tracking must never break an email open or a link click.
    }
  }
}

function recipientIdParam(value: string): bigint {
  let id: bigint;
  try {
    id = BigInt(value);
  } catch {
    throw new NotFoundException("Unknown recipient");
  }
  if (id <= 0n) {
    throw new NotFoundException("Unknown recipient");
  }
  return id;
}

/**
 * Returns the exact bytes the provider sent. `rawBody` is populated because the app is
 * created with `rawBody: true`; the parsed body is only a last resort, since re-encoding
 * parsed JSON would not reproduce the signed bytes.
 */
function readRawBody(request: Request): string {
  const candidate = (request as Request & { rawBody?: Buffer | string }).rawBody;

  if (Buffer.isBuffer(candidate)) return candidate.toString("utf8");
  if (typeof candidate === "string") return candidate;

  return JSON.stringify(request.body ?? {});
}

/** Blocks `javascript:`, `data:` and protocol-relative redirects out of the tracking route. */
function isAllowedRedirect(url: string | undefined): boolean {
  if (!url) return false;
  return REDIRECT_ALLOWLIST.test(url.trim());
}
