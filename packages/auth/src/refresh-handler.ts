import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_URL, LOGIN_PATH, REFRESH_ENDPOINT } from "./constants";
import { applySetCookiesToResponse, getSetCookieLines, parseSetCookieLines } from "./cookies";

export interface RefreshRouteHandlerOptions {
  apiUrl?: string;
  loginPath?: string;
}

/**
 * Validates and safely resolves returnTo URL to prevent open redirect vulnerabilities.
 */
function safeReturnUrl(value: string | null, origin: string): URL {
  if (!value) return new URL("/", origin);
  try {
    const url = new URL(value, origin);
    // Disallow external origins
    if (url.origin !== origin) return new URL("/", origin);
    return url;
  } catch {
    return new URL("/", origin);
  }
}

/**
 * Creates a route handler for /api/auth/refresh that executes the backend refresh call
 * and forwards the Set-Cookie headers exactly as configured by the backend.
 */
export function createRefreshRouteHandler(options: RefreshRouteHandlerOptions = {}) {
  const getApiUrl = (): string => {
    return options.apiUrl || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  };

  const loginPath = options.loginPath || LOGIN_PATH;

  async function callBackendRefresh(request: NextRequest): Promise<{
    upstream: Response;
    parsedCookies: ReturnType<typeof parseSetCookieLines>;
  }> {
    const apiUrl = getApiUrl();
    const cookieHeader = request.headers.get("cookie") ?? "";

    const upstream = await fetch(new URL(REFRESH_ENDPOINT, apiUrl), {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
      },
      cache: "no-store",
      redirect: "manual",
    });

    const cookieLines = getSetCookieLines(upstream.headers);
    const parsedCookies = parseSetCookieLines(cookieLines);

    return { upstream, parsedCookies };
  }

  return {
    /**
     * GET: Used by Next.js Server Components (SSR) when a 401 is encountered.
     * Refreshes credentials, sets updated cookies on NextResponse, and redirects back to returnTo.
     */
    async GET(request: NextRequest): Promise<NextResponse> {
      const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
      const loginUrl = new URL(loginPath, request.nextUrl.origin);
      loginUrl.searchParams.set("returnTo", returnTo);

      try {
        const { upstream, parsedCookies } = await callBackendRefresh(request);

        if (!upstream.ok) {
          const redirectRes = NextResponse.redirect(loginUrl);
          redirectRes.cookies.delete("access_token");
          redirectRes.cookies.delete("refresh_token");
          redirectRes.headers.set("cache-control", "private, no-store");
          return redirectRes;
        }

        const targetUrl = safeReturnUrl(returnTo, request.nextUrl.origin);
        const redirectRes = NextResponse.redirect(targetUrl);

        // Apply backend Set-Cookies directly as single source of truth
        applySetCookiesToResponse(redirectRes, parsedCookies);
        redirectRes.headers.set("cache-control", "private, no-store");
        return redirectRes;
      } catch {
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.cookies.delete("access_token");
        redirectRes.cookies.delete("refresh_token");
        redirectRes.headers.set("cache-control", "private, no-store");
        return redirectRes;
      }
    },

    /**
     * POST: Used by client-side Axios interceptors to refresh credentials seamlessly.
     */
    async POST(request: NextRequest): Promise<NextResponse> {
      try {
        const { upstream, parsedCookies } = await callBackendRefresh(request);

        if (!upstream.ok) {
          const failureRes = NextResponse.json(
            { success: false, message: "Session expired or invalid refresh token" },
            { status: 401 },
          );
          failureRes.cookies.delete("access_token");
          failureRes.cookies.delete("refresh_token");
          failureRes.headers.set("cache-control", "private, no-store");
          return failureRes;
        }

        const data = await upstream.json().catch(() => ({}));
        const successRes = NextResponse.json({
          success: true,
          ...data,
        });

        // Apply backend Set-Cookies directly as single source of truth
        applySetCookiesToResponse(successRes, parsedCookies);
        successRes.headers.set("cache-control", "private, no-store");
        return successRes;
      } catch {
        return NextResponse.json({ success: false, message: "Backend service unavailable" }, { status: 502 });
      }
    },
  };
}
