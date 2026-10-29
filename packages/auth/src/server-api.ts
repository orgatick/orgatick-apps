import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import {
  DEFAULT_API_URL,
  DEFAULT_TIMEOUT_MS,
  FORWARDED_AUTH_COOKIES,
  REFRESH_COOKIE,
  REFRESH_ENDPOINT,
} from "./constants";
import { getSetCookieLines, mergeCookieHeader, parseSetCookieLines } from "./cookies";

export interface CookieStoreLike {
  getAll?(): Array<{ name: string; value: string }>;
  toString?(): string;
  get?(name: string): { name: string; value: string } | undefined;
  set?(name: string, value: string, options?: object): unknown;
  delete?(name: string): unknown;
}

export interface CreateServerApiOptions {
  baseURL?: string;
  timeout?: number;
  cookieStore?: CookieStoreLike;
  currentPath?: string;
  autoRedirectOn401?: boolean;
}

export interface ServerApiOptions extends Omit<CreateServerApiOptions, "cookieStore"> {
  cookieStore?: CookieStoreLike;
}

import { isRedirectError } from "./redirect";

export { isRedirectError };

/**
 * Checks if the current Next.js context allows modifying cookies.
 * React Server Components (RSC) are read-only; Server Actions and Route Handlers are mutable.
 */
function isCookieStoreMutable(store: CookieStoreLike | undefined): boolean {
  if (!store || typeof store.set !== "function") return false;
  try {
    const probeKey = "__cookie_mutability_probe__";
    store.set(probeKey, "", { maxAge: 0 });
    if (typeof store.delete === "function") {
      store.delete(probeKey);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronous factory that creates an Axios instance given a cookie store or options.
 * Useful for tests, Server Actions, or when cookieStore is already resolved.
 */
export function createServerApiClient(options: CreateServerApiOptions = {}): AxiosInstance {
  const cookieStore = options.cookieStore;
  const baseURL = options.baseURL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  const autoRedirectOn401 = options.autoRedirectOn401 ?? true;
  const currentPath = options.currentPath || "/";

  // Build Cookie header from cookieStore
  let cookieHeader = "";
  if (cookieStore) {
    if (typeof cookieStore.getAll === "function") {
      const all = cookieStore.getAll();
      const filtered = all.filter((c) => (FORWARDED_AUTH_COOKIES as readonly string[]).includes(c.name));
      cookieHeader = filtered.map((c) => `${c.name}=${c.value}`).join("; ");
    } else if (typeof cookieStore.toString === "function") {
      cookieHeader = cookieStore.toString();
    }
  }

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      Accept: "application/json",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes(REFRESH_ENDPOINT)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 1. If in a mutable context (Server Action / Route Handler), rotate in-place
      if (isCookieStoreMutable(cookieStore)) {
        try {
          const refreshRes = await axios.post(
            `${baseURL}${REFRESH_ENDPOINT}`,
            {},
            {
              headers: {
                ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                Accept: "application/json",
              },
              validateStatus: (s) => s >= 200 && s < 300,
            },
          );

          const rawSetCookies = getSetCookieLines(new Headers(refreshRes.headers as Record<string, string>));
          const parsedCookies = parseSetCookieLines(rawSetCookies);

          if (parsedCookies.length > 0) {
            cookieHeader = mergeCookieHeader(cookieHeader, parsedCookies);

            // Update cookieStore in-place with exact options from backend
            for (const c of parsedCookies) {
              if (c.options.maxAge !== undefined && c.options.maxAge <= 0) {
                cookieStore?.delete?.(c.name);
              } else {
                cookieStore?.set?.(c.name, c.value, c.options);
              }
            }

            originalRequest.headers.Cookie = cookieHeader;
            return instance(originalRequest);
          }
        } catch {
          return Promise.reject(error);
        }
      }

      // 2. If in read-only Server Component (RSC), redirect to Route Handler ONLY if refresh_token exists
      const hasRefreshToken = Boolean(
        cookieStore?.getAll
          ? cookieStore.getAll().some((c) => c.name === REFRESH_COOKIE && Boolean(c.value))
          : cookieStore?.get
            ? cookieStore.get(REFRESH_COOKIE)?.value
            : cookieHeader.includes(`${REFRESH_COOKIE}=`),
      );

      if (autoRedirectOn401 && hasRefreshToken) {
        let returnTo = currentPath;
        if (returnTo === "/") {
          try {
            const { headers } = await import("next/headers");
            const headerList = await headers();
            const resolved = headerList.get("x-pathname") || headerList.get("x-url");
            if (resolved) {
              returnTo = resolved.startsWith("http") ? new URL(resolved).pathname : resolved;
            }
          } catch {
            returnTo = "/";
          }
        }
        const { redirect } = await import("next/navigation");
        redirect(`/api/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`);
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * Async serverApi helper for React Server Components (RSC) and Server Actions.
 * Automatically resolves `await cookies()` from Next.js.
 */
export async function serverApi(options: ServerApiOptions = {}): Promise<AxiosInstance> {
  let cookieStore = options.cookieStore;
  if (!cookieStore) {
    const { cookies } = await import("next/headers");
    cookieStore = await cookies();
  }
  return createServerApiClient({
    ...options,
    cookieStore,
  });
}

export const createServerApi = serverApi;

export default serverApi;
