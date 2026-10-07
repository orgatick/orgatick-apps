import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

// Access token is kept in memory.
let accessToken: string | null = null;
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};

// Add custom property to Axios request config.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
/**
 * Requests that arrived while a refresh was in flight. They are settled both ways: on success they
 * retry with the new token, and on failure they must be rejected, otherwise they stay pending
 * forever and their caller never learns the session is gone.
 */
type RefreshSubscriber = {
  resolve: (newToken: string) => void;
  reject: (reason: unknown) => void;
};
let refreshSubscribers: RefreshSubscriber[] = [];

const settleRefreshSubscribers = (settler: (subscriber: RefreshSubscriber) => void): void => {
  const pending = refreshSubscribers;
  refreshSubscribers = [];
  pending.forEach(settler);
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    // Another request is already refreshing the token, Wait for it to finish.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({
          resolve: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }
    isRefreshing = true;
    try {
      const refreshUrl = `${API_URL}/auth/refresh`;
      const { data } = await axios.post<{
        data?: { token?: string };
        token?: string;
      }>(refreshUrl, {}, { withCredentials: true });

      const newAccessToken = data.data?.token ?? data.token;
      if (!newAccessToken) throw new Error("No access token returned from refresh endpoint");

      setAccessToken(newAccessToken);
      isRefreshing = false;

      // Retry all queued requests.
      settleRefreshSubscribers(({ resolve }) => resolve(newAccessToken));

      // Retry the original request.
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      clearAccessToken();
      // Queued requests must fail too, or their callers wait for a token that is never coming.
      settleRefreshSubscribers(({ reject }) => reject(refreshError));
      return Promise.reject(refreshError);
    }
  },
);

export default api;
