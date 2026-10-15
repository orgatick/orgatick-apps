import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticationGuard } from "../../guards/authentication.guard";
import { CookieService } from "../cookies.service";
import { SessionService } from "../session.service";
import { TokenRefreshService } from "../token-refresh.service";
import { TokenService } from "../token.service";

describe("Session Lifecycle & Token Refresh Resilience", () => {
  describe("AuthenticationGuard", () => {
    it("throws UnauthorizedException without clearing cookies on expired/missing token", async () => {
      let clearCookiesCalled = false;
      const mockCookieService = {
        getAccessToken: () => "expired-token",
        clearAuthCookies: () => {
          clearCookiesCalled = true;
        },
      } as unknown as CookieService;

      const mockTokenService = {
        verifyAccessToken: async () => {
          throw new UnauthorizedException("jwt expired");
        },
      };

      const mockReflector = {
        getAllAndOverride: () => false,
      } as unknown as Reflector;

      const guard = new AuthenticationGuard(
        mockReflector,
        {} as unknown as SessionService,
        mockCookieService,
        mockTokenService as unknown as TokenService,
        {} as never,
      );

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ cookies: {} }),
          getResponse: () => ({}),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as never;

      await assert.rejects(
        async () => {
          await guard.canActivate(mockContext);
        },
        {
          name: "UnauthorizedException",
        },
      );

      assert.strictEqual(
        clearCookiesCalled,
        false,
        "AuthenticationGuard must NOT clear auth cookies when access token is invalid/expired",
      );
    });
  });

  describe("TokenRefreshService Grace & Multi-Tab Handling", () => {
    it("returns cached grace tokens for concurrent requests within grace period", async () => {
      let cookiesSet: { accessToken?: string } | null = null;
      const mockCookieService = {
        getRefreshToken: () => "valid-refresh-token",
        setAuthCookies: (_res: unknown, tokens: unknown) => {
          cookiesSet = tokens as { accessToken?: string };
        },
        clearAuthCookies: () => {},
      } as unknown as CookieService;

      const mockTokenService = {
        verifyRefreshToken: async () => ({
          sessionId: 10,
          email: "user@example.com",
          rotationCounter: 1, // Sent counter 1
          token: "secret1",
        }),
      };

      const mockUserRepository = {
        findOne: async () => ({ id: 1, email: "user@example.com" }),
      };

      const mockSession = {
        id: 10,
        userId: 1,
        rotationCounter: 2, // Active counter in DB is 2
        sessionTokenHash: "hash2",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        lastActivityAt: new Date(),
      };

      const mockSessionService = {
        getSessionWithTokenHash: async () => mockSession,
        sessionLifespanMs: 30 * 24 * 60 * 60 * 1000,
        cacheTTL: 900_000,
        revokeSession: async () => {
          assert.fail("Should not revoke session on concurrent refresh");
        },
      };

      const mockRedis = {
        get: async () =>
          JSON.stringify({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          }),
        set: async () => "OK",
      };

      const service = new TokenRefreshService(
        mockUserRepository as never,
        {} as never,
        mockCookieService,
        mockTokenService as never,
        mockSessionService as never,
        {} as never,
        { set: async () => {} } as never,
        mockRedis as never,
      );

      const res = await service.refreshToken({ cookies: {} } as never, {} as never);

      assert.strictEqual(res.accessToken, "new-access-token");
      assert.strictEqual((cookiesSet as { accessToken?: string } | null)?.accessToken, "new-access-token");
    });

    it("rejects immediate predecessor without revoking active session when grace cache expired", async () => {
      let sessionRevoked = false;
      let cookiesCleared = false;

      const mockCookieService = {
        getRefreshToken: () => "valid-refresh-token",
        clearAuthCookies: () => {
          cookiesCleared = true;
        },
        setAuthCookies: () => {},
      } as unknown as CookieService;

      const mockTokenService = {
        verifyRefreshToken: async () => ({
          sessionId: 10,
          email: "user@example.com",
          rotationCounter: 1, // Predecessor (active is 2)
          token: "secret1",
        }),
      };

      const mockSession = {
        id: 10,
        userId: 1,
        rotationCounter: 2,
        sessionTokenHash: "hash2",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        lastActivityAt: new Date(),
      };

      const mockSessionService = {
        getSessionWithTokenHash: async () => mockSession,
        sessionLifespanMs: 30 * 24 * 60 * 60 * 1000,
        cacheTTL: 900_000,
        revokeSession: async () => {
          sessionRevoked = true;
        },
      };

      const mockRedis = {
        get: async () => null, // Not found in Redis
        set: async () => "OK",
      };

      const service = new TokenRefreshService(
        { findOne: async () => ({ id: 1, email: "user@example.com" }) } as never,
        {} as never,
        mockCookieService,
        mockTokenService as never,
        mockSessionService as never,
        {} as never,
        { set: async () => {} } as never,
        mockRedis as never,
      );

      await assert.rejects(
        async () => {
          await service.refreshToken({ cookies: {} } as never, {} as never);
        },
        {
          name: "UnauthorizedException",
          message: "Refresh token was already rotated in another window. Please use the current session.",
        },
      );

      assert.strictEqual(sessionRevoked, false, "Immediate predecessor must NOT revoke the active session");
      assert.strictEqual(cookiesCleared, false, "Immediate predecessor must NOT wipe auth cookies");
    });
  });
});
