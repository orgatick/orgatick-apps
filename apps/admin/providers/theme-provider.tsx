"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { getCookieDomain, isThemeValue, THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "@/lib/theme";

/** One year, matching how long the choice should stick. */
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // React 19 refuses to execute a <script> it creates during a client render (and logs an
  // error for it), so the no-flash script is only emitted from the server, where it runs as the
  // HTML parses. On the client it is re-created inert — its job is already done by then, and the
  // effect above re-applies the theme on any remount. See next-themes issue #387.
  const scriptProps = typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} storageKey={THEME_STORAGE_KEY} scriptProps={scriptProps}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}

/**
 * Mirrors the theme into a cookie so all apps sharing the domain (e.g. .orgatick.site)
 * and the Next.js server can read the choice.
 */
function ThemeCookieSync() {
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const isInitialMount = useRef(true);

  // 1. Initial mount: check cookie to see if another app (e.g. client or organizer) set a theme
  useEffect(() => {
    let isSubscribed = true;

    async function initFromCookie() {
      const cookie = await readClientThemeCookie();
      if (!isSubscribed) return;

      const currentTheme = themeRef.current;
      if (isThemeValue(cookie) && cookie !== currentTheme) {
        setTheme(cookie);
      } else if (currentTheme) {
        writeThemeCookie(currentTheme);
      }
      isInitialMount.current = false;
    }

    void initFromCookie();

    return () => {
      isSubscribed = false;
    };
  }, [setTheme]);

  // 2. Subsequent user changes: write to cookie with domain
  useEffect(() => {
    if (isInitialMount.current) return;
    if (theme) {
      writeThemeCookie(theme);
    }
  }, [theme]);

  // 3. Listen for changes from other tabs or other subdomains
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("cookieStore" in window && window.cookieStore) {
      const handleCookieChange = (event: Event) => {
        const changeEvent = event as { changed?: Array<{ name: string; value?: string }> };
        const changed = changeEvent.changed?.find((c) => c.name === THEME_COOKIE_NAME);
        if (changed?.value && isThemeValue(changed.value) && changed.value !== theme) {
          setTheme(changed.value);
        }
      };

      window.cookieStore.addEventListener("change", handleCookieChange);
      return () => {
        window.cookieStore?.removeEventListener("change", handleCookieChange);
      };
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue && isThemeValue(event.newValue)) {
        if (event.newValue !== theme) {
          setTheme(event.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme, setTheme]);

  return null;
}

export async function readClientThemeCookie(): Promise<string | undefined> {
  if (typeof window !== "undefined" && "cookieStore" in window && window.cookieStore) {
    try {
      const entry = await window.cookieStore.get(THEME_COOKIE_NAME);
      if (entry?.value) return decodeURIComponent(entry.value);
    } catch {
      // Fallback to legacy document.cookie reader
    }
  }

  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));

  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function writeThemeCookie(theme: string): void {
  const domain = getCookieDomain();
  const domainAttr = domain ? `; domain=${domain}` : "";

  if (domain && typeof document !== "undefined") {
    // biome-ignore lint/suspicious/noDocumentCookie: Clear host-only cookie
    document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  if (typeof window !== "undefined" && "cookieStore" in window && window.cookieStore) {
    window.cookieStore
      .set({
        name: THEME_COOKIE_NAME,
        value: theme,
        path: "/",
        expires: Date.now() + THEME_COOKIE_MAX_AGE_SECONDS * 1000,
        sameSite: "lax",
        ...(domain ? { domain } : {}),
      })
      .catch(() => {
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API fallback
        document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax${domainAttr}`;
      });
    return;
  }

  if (typeof document !== "undefined") {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API fallback for non-Chromium browsers
    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax${domainAttr}`;
  }
}
