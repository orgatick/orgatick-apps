/**
 * Theme values shared by the server and the client.
 *
 * Kept free of `next/headers` so client components can import the types and constants
 * without pulling server-only code into the browser bundle. The cookie reader lives in
 * `lib/theme-cookie.ts`.
 */

export const THEME_STORAGE_KEY = "theme";

export const THEME_COOKIE_NAME = "theme";

export const THEME_VALUES = ["system", "light", "dark"] as const;

export type ThemeValue = (typeof THEME_VALUES)[number];

export const DEFAULT_THEME: ThemeValue = "system";

export function isThemeValue(value: unknown): value is ThemeValue {
  return typeof value === "string" && (THEME_VALUES as readonly string[]).includes(value);
}
