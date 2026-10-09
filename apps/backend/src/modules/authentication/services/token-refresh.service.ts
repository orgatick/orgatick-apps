import crypto from "node:crypto";
import { type Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Request, Response } from "express";
import type Redis from "ioredis";
import type { Repository } from "typeorm";
import { REDIS_CLIENT } from "@/infrastructure/redis/redis.constants";
import { BcryptUtils } from "@/common/utils/bcrypt.utils";
import { normalizeEmail } from "@/common/utils/email.util";
import { LoginAttemptStatus } from "@/modules/identity/entities/user-login-attempt.entity";
import { UserSession } from "@/modules/identity/entities/user-session.entity";
import { LoginAttemptService } from "@/modules/identity/service/login-attempt.service";
import { User } from "@/modules/users/entities/user.entity";
import type { JwtPayload } from "../types/jwt-payload.types";
import type { TokenPair } from "../types/token-pair.types";
import { CookieService } from "./cookies.service";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";

@Injectable()
export class TokenRefreshService {
  private readonly logger = new Logger(TokenRefreshService.name);
  private readonly bcryptUtils = new BcryptUtils();
  private readonly gracePeriodSeconds = 300; // 5m grace window to handle concurrent requests, multi-tab bursts & SSR
  private readonly memoryGraceCache = new Map<string, { tokenPair: TokenPair; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly cookieService: CookieService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly loginAttemptService: LoginAttemptService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private async getGraceTokens(key: string): Promise<TokenPair | null> {
    const mem = this.memoryGraceCache.get(key);
    if (mem) {
      if (Date.now() < mem.expiresAt) {
        return mem.tokenPair;
      }
      this.memoryGraceCache.delete(key);
    }

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as TokenPair;
      }
    } catch (err) {
      this.logger.warn(`Redis get failed for grace key ${key}: ${(err as Error).message}`);
    }
    return null;
  }

  private async setGraceTokens(key: string, tokenPair: TokenPair): Promise<void> {
    const now = Date.now();
    this.memoryGraceCache.set(key, {
      tokenPair,
      expiresAt: now + this.gracePeriodSeconds * 1000,
    });

    for (const [k, v] of this.memoryGraceCache.entries()) {
      if (v.expiresAt <= now) {
        this.memoryGraceCache.delete(k);
      }
    }

    try {
      await this.redis.set(key, JSON.stringify(tokenPair), "EX", this.gracePeriodSeconds);
    } catch (err) {
      this.logger.warn(`Redis set failed for grace key ${key}: ${(err as Error).message}`);
    }
  }

  async refreshToken(
    request: Request,
    response: Response,
  ): Promise<{ message: string; token?: string; accessToken?: string }> {
    const refreshToken = this.cookieService.getRefreshToken(request);
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token found");
    }

    let tokenPayload: JwtPayload;
    try {
      tokenPayload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const normalizedEmail = normalizeEmail(tokenPayload.email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("User not found");
    }

    // Load session including the hidden sessionTokenHash
    const session = await this.sessionService.getSessionWithTokenHash(tokenPayload.sessionId, user.id);
    if (!session) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Session not found");
    }

    // Check if session is already revoked
    if (session.revokedAt) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Session has been revoked");
    }

    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Session has expired");
    }

    const tokenCounter = tokenPayload.rotationCounter ?? 1;
    const sessionCounter = session.rotationCounter ?? 1;

    // Detect refresh token reuse (the token counter is strictly less than current active rotation)
    if (tokenCounter < sessionCounter) {
      const isImmediatePredecessor = tokenCounter === sessionCounter - 1;

      // Check if this token was rotated within the concurrent-request grace period (e.g. multi-tab burst or SSR)
      const graceKey = `refresh_grace:${session.id}:${tokenCounter}`;
      const cachedGraceTokens = await this.getGraceTokens(graceKey);

      if (cachedGraceTokens) {
        this.logger.warn(
          `Concurrent refresh token request within grace period for session ${session.id} (counter: ${tokenCounter})`,
        );
        this.cookieService.setAuthCookies(response, cachedGraceTokens);
        return {
          message: "Access token refreshed successfully",
          token: cachedGraceTokens.accessToken,
          accessToken: cachedGraceTokens.accessToken,
        };
      }

      // If it is the immediate predecessor, do NOT revoke the active session or wipe cookies!
      // Multi-tab lag or sleep could cause this tab to send a 1-step stale token.
      if (isImmediatePredecessor) {
        this.logger.warn(
          `Stale refresh token request for session ${session.id} (counter: ${tokenCounter}, active: ${sessionCounter}). Rejecting request without revoking active session.`,
        );
        throw new UnauthorizedException(
          "Refresh token was already rotated in another window. Please use the current session.",
        );
      }

      // OUTSIDE GRACE PERIOD and older generation -> Token Reuse / Replay Attack Detected!
      this.logger.error(
        `SECURITY ALERT: Refresh token reuse detected for user ${user.id}, session ${session.id}. Token counter: ${tokenCounter}, active counter: ${sessionCounter}. Revoking session family.`,
      );

      // Revoke the entire session / token family immediately according to policy
      await this.sessionService.revokeSession(session.id, user.id, "refresh_token_reuse");
      this.cookieService.clearAuthCookies(response);

      // Record security audit attempt
      await this.loginAttemptService.recordAttempt({
        email: user.email,
        userId: user.id,
        ipAddress: request.ip ?? null,
        userAgent: (request.headers["user-agent"] as string) ?? null,
        status: LoginAttemptStatus.FAILED,
        failureReason: `Refresh token reuse detected: counter ${tokenCounter} < ${sessionCounter}. Session family revoked.`,
      });

      throw new UnauthorizedException("Refresh token reuse detected. Session has been revoked for security.");
    }

    // If counter is ahead of the database, the token was forged or invalid
    if (tokenCounter > sessionCounter) {
      this.logger.error(
        `SECURITY ALERT: Invalid refresh token counter sequence for user ${user.id}, session ${session.id}. Token counter: ${tokenCounter}, active: ${sessionCounter}. Revoking session.`,
      );
      await this.sessionService.revokeSession(session.id, user.id, "invalid_refresh_token_sequence");
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Invalid refresh token sequence. Session revoked.");
    }

    // Check token secret hash matching
    const isTokenValid = await this.bcryptUtils.compareString(tokenPayload.token, session.sessionTokenHash);
    if (!isTokenValid) {
      this.logger.error(
        `SECURITY ALERT: Refresh token hash mismatch for session ${session.id}. Revoking session family.`,
      );
      await this.sessionService.revokeSession(session.id, user.id, "invalid_refresh_token_hash");
      this.cookieService.clearAuthCookies(response);
      throw new UnauthorizedException("Invalid refresh token. Session revoked.");
    }

    // --- SECURE REFRESH TOKEN ROTATION AND REPLACEMENT ---
    const nextSecret = crypto.randomBytes(32).toString("hex");
    const nextHash = await this.bcryptUtils.hashString(nextSecret);
    const nextCounter = sessionCounter + 1;
    const now = new Date();
    const newExpiresAt = new Date(Date.now() + this.sessionService.sessionLifespanMs);

    session.sessionTokenHash = nextHash;
    session.rotationCounter = nextCounter;
    session.lastActivityAt = now;
    session.expiresAt = newExpiresAt;
    await this.userSessionRepository.save(session);

    // Refresh Redis session cache
    try {
      await this.cacheManager.set(`session:${session.id}`, session, this.sessionService.cacheTTL);
    } catch (err) {
      this.logger.warn(`Failed to update session cache for session ${session.id}: ${(err as Error).message}`);
    }

    // Generate new rotated token pair
    const tokenPair: TokenPair = await this.tokenService.generateTokenPair({
      email: user.email,
      sessionId: session.id,
      token: nextSecret,
      rotationCounter: nextCounter,
    });

    // Store in grace cache for network race conditions / multi-tab bursts
    await this.setGraceTokens(`refresh_grace:${session.id}:${sessionCounter}`, tokenPair);

    // Issue updated secure httpOnly cookies (rotates both access and refresh tokens)
    this.cookieService.setAuthCookies(response, tokenPair);

    return {
      message: "Access token refreshed successfully",
      token: tokenPair.accessToken,
      accessToken: tokenPair.accessToken,
    };
  }
}
