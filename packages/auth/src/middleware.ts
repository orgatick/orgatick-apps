import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, DEFAULT_API_URL, REFRESH_COOKIE, REFRESH_ENDPOINT } from "./constants";
import { applySetCookiesToResponse, getSetCookieLines, parseSetCookieLines } from "./cookies";

export interface AuthMiddlewareOptions {
  apiUrl?: string;
}

import { isJwtExpired } from "./jwt";

export { isJwtExpired };

/**
 * Factory creating Next.js middleware that:
 * 1. Proactively detects missing or expired access_token when refresh_token is present.
 * 2. Refreshes tokens via the backend before Server Components run.
 * 3. Injects updated cookies both on the downstream request (for RSC) and response (for browser).
 * 4. Injects x-pathname so Server Components always know the current route.
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const getApiUrl = (): string => {
    return options.apiUrl || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  };

  return async function authMiddleware(request: NextRequest): Promise<NextResponse> {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);
    requestHeaders.set("x-url", request.url);

    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    const isAccessExpired = isJwtExpired(accessToken);

    // If access token is missing or expired, but a refresh token exists, refresh proactively!
    if (isAccessExpired && refreshToken) {
      const apiUrl = getApiUrl();
      const cookieHeader = request.headers.get("cookie") ?? "";

      try {
        const upstream = await fetch(new URL(REFRESH_ENDPOINT, apiUrl), {
          method: "POST",
          headers: {
            cookie: cookieHeader,
            accept: "application/json",
          },
          cache: "no-store",
          redirect: "manual",
        });

        if (upstream.ok) {
          const cookieLines = getSetCookieLines(upstream.headers);
          const parsedCookies = parseSetCookieLines(cookieLines);

          for (const c of parsedCookies) {
            if (c.options.maxAge !== undefined && c.options.maxAge <= 0) {
              request.cookies.delete(c.name);
            } else {
              request.cookies.set(c.name, c.value);
            }
          }

          // Forward updated cookies in request headers
          const updatedCookieHeader = request.cookies
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");
          requestHeaders.set("cookie", updatedCookieHeader);

          // Create response with updated request headers for RSC
          const response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          // Apply backend cookies AS-IS to response headers for the browser
          applySetCookiesToResponse(response, parsedCookies);
          response.headers.set("cache-control", "private, no-store");
          return response;
        }

        // If refresh failed (token expired/revoked), delete auth cookies
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
        return response;
      } catch {
        // If backend is temporarily unreachable, let downstream handle or show error
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}
