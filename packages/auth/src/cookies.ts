import type { NextResponse } from "next/server";

export interface CookieOptions {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}

export interface ParsedSetCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Resolves cookie domain from environment variables for cross-subdomain sharing.
 * Omitted on localhost to prevent browser rejection.
 */
export function resolveCookieDomain(explicitDomain?: string): string | undefined {
  const configured =
    explicitDomain ||
    process.env.COOKIE_DOMAIN ||
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN ||
    process.env.NEXT_PUBLIC_COOKIES_DOMIN;

  if (!configured) return undefined;
  if (configured.includes("localhost") || configured === "127.0.0.1") return undefined;

  return configured.startsWith(".") ? configured : `.${configured}`;
}

/**
 * Extracts multiple Set-Cookie headers from fetch Response/Headers.
 * Uses getSetCookie() if available (Node 18+ standard), falling back to raw get.
 */
export function getSetCookieLines(headers: Headers): string[] {
  const maybeGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof maybeGetSetCookie.getSetCookie === "function") {
    return maybeGetSetCookie.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

/**
 * Parses raw Set-Cookie strings exactly as sent by the backend.
 * The backend is the single source of truth for attributes (maxAge, httpOnly, secure, sameSite, path, domain).
 */
export function parseSetCookieLines(lines: string | string[] | undefined): ParsedSetCookie[] {
  if (!lines) return [];
  const rawHeaders = Array.isArray(lines) ? lines : [lines];
  const parsed: ParsedSetCookie[] = [];

  for (const raw of rawHeaders) {
    if (!raw || typeof raw !== "string") continue;
    const parts = raw.split(";").map((p) => p.trim());
    const firstPart = parts[0];
    if (!firstPart) continue;

    const eqIdx = firstPart.indexOf("=");
    if (eqIdx === -1) continue;

    const name = firstPart.substring(0, eqIdx).trim();
    const value = firstPart.substring(eqIdx + 1).trim();
    if (!name) continue;

    const options: CookieOptions = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const pEq = part.indexOf("=");
      const key = (pEq === -1 ? part : part.substring(0, pEq)).trim().toLowerCase();
      const val = pEq === -1 ? "" : part.substring(pEq + 1).trim();

      if (key === "domain" && val) {
        // Exclude domain on localhost to prevent browser rejection
        if (!val.includes("localhost") && val !== "127.0.0.1") {
          options.domain = val.startsWith(".") ? val : `.${val}`;
        }
      } else if (key === "path" && val) {
        options.path = val;
      } else if (key === "max-age" && val) {
        const num = Number.parseInt(val, 10);
        if (!Number.isNaN(num)) options.maxAge = num;
      } else if (key === "expires" && val) {
        const d = new Date(val);
        if (!Number.isNaN(d.getTime())) options.expires = d;
      } else if (key === "httponly") {
        options.httpOnly = true;
      } else if (key === "secure") {
        options.secure = true;
      } else if (key === "samesite" && val) {
        const lower = val.toLowerCase();
        if (lower === "lax" || lower === "strict" || lower === "none") {
          options.sameSite = lower;
        }
      }
    }

    // Default path if omitted by backend
    if (!options.path) {
      options.path = "/";
    }

    parsed.push({ name, value, options });
  }

  return parsed;
}

/**
 * Applies parsed backend cookies directly to a Next.js NextResponse as-is.
 */
export function applySetCookiesToResponse(response: NextResponse, cookies: ParsedSetCookie[]): void {
  for (const cookie of cookies) {
    const isExpired =
      cookie.value === "" ||
      (cookie.options.maxAge !== undefined && cookie.options.maxAge <= 0) ||
      (cookie.options.expires !== undefined && cookie.options.expires.getTime() <= Date.now());

    if (isExpired) {
      response.cookies.delete({
        name: cookie.name,
        path: cookie.options.path ?? "/",
        domain: cookie.options.domain,
      });
    } else {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
  }
}

/**
 * Merges updated Set-Cookie headers into an existing Cookie header string for request retries.
 */
export function mergeCookieHeader(existingHeader: string, newCookies: ParsedSetCookie[]): string {
  const map = new Map<string, string>();

  if (existingHeader) {
    for (const pair of existingHeader.split(";")) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        if (k) map.set(k, v);
      }
    }
  }

  for (const cookie of newCookies) {
    const isExpired =
      cookie.value === "" ||
      (cookie.options.maxAge !== undefined && cookie.options.maxAge <= 0) ||
      (cookie.options.expires !== undefined && cookie.options.expires.getTime() <= Date.now());

    if (isExpired) {
      map.delete(cookie.name);
    } else {
      map.set(cookie.name, cookie.value);
    }
  }

  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}
