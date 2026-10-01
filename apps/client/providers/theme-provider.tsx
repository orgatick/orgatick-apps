"use client";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { isThemeValue, THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "@/lib/theme";

const THEME_TRANSITION_MS = 380;

/** One year, matching how long the choice should stick. */
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    const root = document.documentElement;
    const classList = root.classList;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type !== "attributes" || record.attributeName !== "class") continue;
        const wasDark = record.oldValue?.split(/\s+/).includes("dark") ?? false;
        if (wasDark === classList.contains("dark")) continue;
        classList.add("theme-transition");
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => classList.remove("theme-transition"), THEME_TRANSITION_MS);
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return (
    <NextThemesProvider {...props} storageKey={THEME_STORAGE_KEY}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}

/**
 * Mirrors the theme into a cookie the server can read.
 *
 * `next-themes` only persists to `localStorage`, which the server cannot see, so any
 * theme-dependent markup mismatches on hydration. This writes the cookie on mount (adopting
 * a value that already exists locally) and on every later change.
 */
function ThemeCookieSync() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const cookie = readThemeCookie();

    // A cookie from an earlier visit wins when `localStorage` was cleared, so the two stores
    // cannot drift and cause a mismatch.
    if (isThemeValue(cookie) && cookie !== theme) {
      setTheme(cookie);
      return;
    }

    if (theme) {
      writeThemeCookie(theme);
    }
  }, [theme, setTheme]);

  return null;
}

function readThemeCookie(): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));

  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function writeThemeCookie(theme: string): void {
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}
