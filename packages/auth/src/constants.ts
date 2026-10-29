export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const CONTEXT_COOKIE = "current_organization_id";

export const FORWARDED_AUTH_COOKIES = [ACCESS_COOKIE, REFRESH_COOKIE, CONTEXT_COOKIE] as const;

export const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_API_URL = "http://localhost:5050";
export const REFRESH_ENDPOINT = "/auth/refresh";
export const LOGIN_PATH = "/login";
