import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeValue, THEME_COOKIE_NAME, type ThemeValue } from "./theme";

/**
 * Reads the stored theme on the server. Server components only.
 */
export async function readThemeCookie(): Promise<ThemeValue> {
  let value = (await cookies()).get(THEME_COOKIE_NAME)?.value;
  if (value?.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  return isThemeValue(value) ? value : DEFAULT_THEME;
}
