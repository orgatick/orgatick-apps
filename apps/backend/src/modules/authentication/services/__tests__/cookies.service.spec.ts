import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { CookieService } from "../cookies.service";

function createMockConfigService(env: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
}

describe("CookieService Scoping & Attributes", () => {
  it("scopes cookies to .orgatick.site with SameSite=Lax and Secure=true in development when domain is set", () => {
    const config = createMockConfigService({
      NODE_ENV: "development",
      COOKIE_DOMAIN: ".orgatick.site",
    });
    const service = new CookieService(config);

    const cookiesSet: Array<{ name: string; val: string; options: Record<string, unknown> }> = [];
    const mockRes = {
      cookie: (name: string, val: string, options: Record<string, unknown>) => {
        cookiesSet.push({ name, val, options });
      },
      clearCookie: () => {},
    } as unknown as Response;

    service.setAuthCookies(mockRes, {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });

    assert.strictEqual(cookiesSet.length, 2);
    const accessCookie = cookiesSet.find((c) => c.name === "access_token");
    const refreshCookie = cookiesSet.find((c) => c.name === "refresh_token");

    assert.ok(accessCookie, "access_token cookie must be set");
    assert.strictEqual(accessCookie.val, "mock-access-token");
    assert.strictEqual(accessCookie.options.domain, ".orgatick.site");
    assert.strictEqual(accessCookie.options.httpOnly, true);
    assert.strictEqual(accessCookie.options.secure, true);
    assert.strictEqual(accessCookie.options.sameSite, "lax");
    assert.strictEqual(accessCookie.options.path, "/");

    assert.ok(refreshCookie, "refresh_token cookie must be set");
    assert.strictEqual(refreshCookie.val, "mock-refresh-token");
    assert.strictEqual(refreshCookie.options.domain, ".orgatick.site");
    assert.strictEqual(refreshCookie.options.httpOnly, true);
    assert.strictEqual(refreshCookie.options.secure, true);
    assert.strictEqual(refreshCookie.options.sameSite, "lax");
  });

  it("normalizes domain without leading dot to have leading dot", () => {
    const config = createMockConfigService({
      NODE_ENV: "production",
      COOKIE_DOMAIN: "orgatick.site",
    });
    const service = new CookieService(config);

    const cookiesSet: Array<{ name: string; val: string; options: Record<string, unknown> }> = [];
    const mockRes = {
      cookie: (name: string, val: string, options: Record<string, unknown>) => {
        cookiesSet.push({ name, val, options });
      },
    } as unknown as Response;

    service.setAccessToken(mockRes, "sample-token");
    assert.strictEqual(cookiesSet[0]?.options.domain, ".orgatick.site");
    assert.strictEqual(cookiesSet[0]?.options.secure, true);
  });

  it("omits domain and disables secure for localhost in local development", () => {
    const config = createMockConfigService({
      NODE_ENV: "development",
      COOKIE_DOMAIN: "localhost",
    });
    const service = new CookieService(config);

    const cookiesSet: Array<{ name: string; val: string; options: Record<string, unknown> }> = [];
    const mockRes = {
      cookie: (name: string, val: string, options: Record<string, unknown>) => {
        cookiesSet.push({ name, val, options });
      },
    } as unknown as Response;

    service.setAuthCookies(mockRes, {
      accessToken: "local-token",
      refreshToken: "local-refresh",
    });

    assert.strictEqual(cookiesSet[0]?.options.domain, undefined);
    assert.strictEqual(cookiesSet[0]?.options.secure, false);
    assert.strictEqual(cookiesSet[0]?.options.sameSite, "lax");
  });

  it("clears both host-only and domain cookies when clearing auth cookies with domain", () => {
    const config = createMockConfigService({
      NODE_ENV: "production",
      COOKIE_DOMAIN: ".orgatick.site",
    });
    const service = new CookieService(config);

    const cleared: Array<{ name: string; options?: Record<string, unknown> }> = [];
    const mockRes = {
      clearCookie: (name: string, options?: Record<string, unknown>) => {
        cleared.push({ name, options });
      },
    } as unknown as Response;

    service.clearAuthCookies(mockRes);

    // Clears host-only access_token & refresh_token, plus domain access_token & refresh_token
    assert.strictEqual(cleared.length, 4);
    assert.strictEqual(cleared[0]?.name, "access_token");
    assert.strictEqual(cleared[0]?.options?.path, "/");
    assert.strictEqual(cleared[0]?.options?.domain, undefined);

    assert.strictEqual(cleared[2]?.name, "access_token");
    assert.strictEqual(cleared[2]?.options?.domain, ".orgatick.site");
  });
});
