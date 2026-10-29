import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeCookieHeader, parseSetCookieLines, resolveCookieDomain } from "../cookies.ts";

describe("Cookies & Backend Single Source of Truth", () => {
  it("preserves backend cookie attributes verbatim from Set-Cookie", () => {
    const rawHeader = [
      "access_token=test_access_jwt; Path=/; Expires=Wed, 29 Oct 2026 12:00:00 GMT; Max-Age=900; HttpOnly; SameSite=Lax",
      "refresh_token=test_refresh_jwt; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax",
    ];

    const parsed = parseSetCookieLines(rawHeader);
    assert.equal(parsed.length, 2);

    // Access token
    assert.equal(parsed[0].name, "access_token");
    assert.equal(parsed[0].value, "test_access_jwt");
    assert.equal(parsed[0].options.path, "/");
    assert.equal(parsed[0].options.maxAge, 900);
    assert.equal(parsed[0].options.httpOnly, true);
    assert.equal(parsed[0].options.sameSite, "lax");

    // Refresh token
    assert.equal(parsed[1].name, "refresh_token");
    assert.equal(parsed[1].value, "test_refresh_jwt");
    assert.equal(parsed[1].options.path, "/");
    assert.equal(parsed[1].options.maxAge, 2592000);
    assert.equal(parsed[1].options.httpOnly, true);
    assert.equal(parsed[1].options.secure, true);
    assert.equal(parsed[1].options.sameSite, "lax");
  });

  it("handles cookie deletions with Max-Age=0", () => {
    const rawHeader = ["access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"];

    const parsed = parseSetCookieLines(rawHeader);
    assert.equal(parsed[0].name, "access_token");
    assert.equal(parsed[0].options.maxAge, 0);

    const merged = mergeCookieHeader("access_token=old_token; theme=dark", parsed);
    assert.equal(merged, "theme=dark");
  });

  it("merges updated cookies into Cookie header for in-place retries", () => {
    const rawHeader = ["access_token=new_access_token; Path=/; Max-Age=900; HttpOnly; SameSite=Lax"];
    const parsed = parseSetCookieLines(rawHeader);
    const merged = mergeCookieHeader("access_token=old_token; refresh_token=old_refresh", parsed);

    assert.equal(merged.includes("access_token=new_access_token"), true);
    assert.equal(merged.includes("refresh_token=old_refresh"), true);
  });

  it("resolves cookie domain omitting localhost", () => {
    assert.equal(resolveCookieDomain("localhost"), undefined);
    assert.equal(resolveCookieDomain("127.0.0.1"), undefined);
    assert.equal(resolveCookieDomain("orgatick.site"), ".orgatick.site");
    assert.equal(resolveCookieDomain(".orgatick.site"), ".orgatick.site");
  });
});

describe("JWT & SSR Error Utilities", () => {
  it("detects expired or invalid JWTs correctly", async () => {
    const { isJwtExpired } = await import("../jwt.ts");
    assert.equal(isJwtExpired(undefined), true);
    assert.equal(isJwtExpired("invalid.token"), true);

    // Expired token (exp in past)
    const pastPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 30 })).toString("base64url");
    const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${pastPayload}.signature`;
    assert.equal(isJwtExpired(expiredToken), true);

    // Valid token (exp 1 hour in future)
    const futurePayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString(
      "base64url",
    );
    const validToken = `eyJhbGciOiJIUzI1NiJ9.${futurePayload}.signature`;
    assert.equal(isJwtExpired(validToken), false);
  });

  it("identifies Next.js redirect errors correctly", async () => {
    const { isRedirectError } = await import("../redirect.ts");
    assert.equal(isRedirectError(null), false);
    assert.equal(isRedirectError(new Error("Generic error")), false);
    assert.equal(isRedirectError({ digest: "NEXT_REDIRECT;replace;/api/auth/refresh?returnTo=%2F;" }), true);
  });
});
