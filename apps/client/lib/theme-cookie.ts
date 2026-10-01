import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeValue, THEME_COOKIE_NAME, type ThemeValue } from "./theme";

/**
 * Reads the stored theme on the server. Server components only: importing `next/headers`
 * into a client component is a build error.
 *
 * `next-themes` persists the theme in `localStorage`, which the server cannot see, so any
 * markup derived from the theme mismatches on hydration. The client mirrors the choice into
 * this cookie (see `providers/theme-provider.tsx`), which makes the server render the same
 * theme the browser is about to render.
 */
export async function readThemeCookie(): Promise<ThemeValue> {
  const value = (await cookies()).get(THEME_COOKIE_NAME)?.value;

  return isThemeValue(value) ? value : DEFAULT_THEME;
}
