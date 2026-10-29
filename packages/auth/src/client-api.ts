import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { DEFAULT_API_URL, DEFAULT_TIMEOUT_MS } from "./constants";

export interface ClientApiOptions {
  baseURL?: string;
  timeout?: number;
  refreshEndpoint?: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type RefreshSubscriber = {
  resolve: (newToken: string | null) => void;
  reject: (reason: unknown) => void;
};

// Access token kept in memory for client sessions
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const clearAccessToken = (): void => {
  inMemoryAccessToken = null;
};

/**
 * Creates an Axios instance for client-side ("use client") components
 * with automatic credential forwarding, concurrent 401 refresh queuing, and token retries.
 */
export function createClientApi(options: ClientApiOptions = {}): AxiosInstance {
  const baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  const refreshEndpoint = options.refreshEndpoint || "/api/auth/refresh";

  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
  });

  let isRefreshing = false;
  let refreshSubscribers: RefreshSubscriber[] = [];

  const settleSubscribers = (settler: (sub: RefreshSubscriber) => void) => {
    const pending = refreshSubscribers;
    refreshSubscribers = [];
    for (const sub of pending) {
      settler(sub);
    }
  };

  // Request interceptor to attach in-memory Bearer token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (inMemoryAccessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // Response interceptor with concurrent refresh mutex
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Never retry the refresh endpoint itself
      const requestUrl = originalRequest.url ?? "";
      if (requestUrl.includes("/auth/refresh") || requestUrl.includes(refreshEndpoint)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If another refresh call is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({
            resolve: (newToken) => {
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // Call the same-origin Next.js Route Handler /api/auth/refresh
        const { data } = await axios.post<{
          success?: boolean;
          token?: string;
          accessToken?: string;
          data?: { token?: string; accessToken?: string };
        }>(refreshEndpoint, {}, { withCredentials: true });

        const newToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken || null;

        if (newToken) {
          setAccessToken(newToken);
        }

        isRefreshing = false;

        // Resume all queued concurrent requests
        settleSubscribers(({ resolve }) => resolve(newToken));

        // Retry the original request
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return instance(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        clearAccessToken();

        // Reject all queued requests
        settleSubscribers(({ reject }) => reject(refreshErr));

        return Promise.reject(refreshErr);
      }
    },
  );

  return instance;
}

/**
 * Default singleton client-side API instance.
 */
export const clientApi = createClientApi();

export default clientApi;
