"use client";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { getCookieDomain, isThemeValue, THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "@/lib/theme";

/** One year, matching how long the choice should stick. */
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props} storageKey={THEME_STORAGE_KEY} disableTransitionOnChange>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}

/**
 * Synchronizes the theme across all Orgatick subdomains using the shared domain cookie (.orgatick.site).
 *
 * Rules:
 * 1. The shared cookie is the single source of truth across apps.
 * 2. On mount, if a cookie exists from another app, this app adopts it and NEVER overwrites it with stale localStorage.
 * 3. Only explicit user changes in this app write to the domain cookie.
 * 4. When switching back to this tab, it checks if another app updated the cookie and synchronizes smoothly.
 */
function ThemeCookieSync() {
  const { theme, setTheme } = useTheme();
  const hasInitializedRef = useRef(false);
  const lastSyncedThemeRef = useRef<string | null>(null);

  // 1. Initial mount: domain cookie is the authority across all subdomains.
  // If a cookie exists from another app, adopt it without overwriting it.
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const cookieTheme = readClientThemeCookie();
    if (isThemeValue(cookieTheme)) {
      lastSyncedThemeRef.current = cookieTheme;
      if (cookieTheme !== theme) {
        setTheme(cookieTheme);
      }
    } else if (theme && isThemeValue(theme)) {
      // First-ever visit across all apps: seed the domain cookie
      lastSyncedThemeRef.current = theme;
      writeThemeCookie(theme);
    }
  }, [theme, setTheme]);

  // 2. Active user change in this app: update the shared domain cookie
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (!theme || !isThemeValue(theme)) return;

    if (lastSyncedThemeRef.current !== null && lastSyncedThemeRef.current !== theme) {
      lastSyncedThemeRef.current = theme;
      writeThemeCookie(theme);
    }
  }, [theme]);

  // 3. Tab visibility / focus: if another app updated the cookie, sync without writing back
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromCookie = () => {
      const cookieTheme = readClientThemeCookie();
      if (isThemeValue(cookieTheme) && cookieTheme !== lastSyncedThemeRef.current) {
        lastSyncedThemeRef.current = cookieTheme;
        if (cookieTheme !== theme) {
          setTheme(cookieTheme);
        }
      }
    };

    window.addEventListener("focus", syncFromCookie);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncFromCookie();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", syncFromCookie);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [theme, setTheme]);

  return null;
}

export function readClientThemeCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));
  const raw = match?.[1] ? decodeURIComponent(match[1]).trim() : undefined;
  if (raw?.startsWith('"') && raw.endsWith('"')) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function writeThemeCookie(theme: string): void {
  if (typeof document === "undefined") return;

  const domain = getCookieDomain();
  const domainAttr = domain ? `; domain=${domain}` : "";

  if (domain) {
    // Clear any conflicting host-only cookie so the domain cookie is the sole cookie
    // biome-ignore lint/suspicious/noDocumentCookie: Clear host-only cookie
    document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Standard theme cookie persistence
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax${domainAttr}`;
}
