/**
 * Theme values shared by the server and the client for Admin.
 */

export const THEME_STORAGE_KEY = "theme";

export const THEME_COOKIE_NAME = "theme";

export const THEME_VALUES = ["system", "light", "dark"] as const;

export type ThemeValue = (typeof THEME_VALUES)[number];

export const DEFAULT_THEME: ThemeValue = "system";

export function isThemeValue(value: unknown): value is ThemeValue {
  return typeof value === "string" && (THEME_VALUES as readonly string[]).includes(value);
}

/**
 * Resolves the cookie domain to use for cross-subdomain sharing across apps (e.g. .orgatick.site).
 * Reads NEXT_PUBLIC_COOKIES_DOMIN (or NEXT_PUBLIC_COOKIE_DOMAIN / COOKIE_DOMAIN).
 * If running on localhost or a non-matching host, returns undefined so host-only cookies
 * are used safely without browser domain rejection errors.
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const configured =
    process.env.NEXT_PUBLIC_COOKIES_DOMIN || process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN;

  if (!configured) return undefined;

  const baseDomain = configured.startsWith(".") ? configured.slice(1) : configured;
  const hostname = window.location.hostname;

  if (hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)) {
    return configured.startsWith(".") ? configured : `.${configured}`;
  }

  return undefined;
}
