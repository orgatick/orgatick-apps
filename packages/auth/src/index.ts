// Constants
export {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  CONTEXT_COOKIE,
  FORWARDED_AUTH_COOKIES,
  DEFAULT_API_URL,
  DEFAULT_TIMEOUT_MS,
  REFRESH_ENDPOINT,
  LOGIN_PATH,
} from "./constants";

// Cookie Utilities
export {
  type CookieOptions,
  type ParsedSetCookie,
  getSetCookieLines,
  parseSetCookieLines,
  parseSetCookieLines as parseSetCookieHeader,
  applySetCookiesToResponse,
  mergeCookieHeader,
  resolveCookieDomain,
} from "./cookies";

// Client-side API
export {
  createClientApi,
  clientApi,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  type ClientApiOptions,
} from "./client-api";

// Server-side API
export {
  createServerApi,
  createServerApiClient,
  serverApi,
  isRedirectError,
  type CreateServerApiOptions,
  type ServerApiOptions,
  type CookieStoreLike,
} from "./server-api";

// Route Handler Factory
export {
  createRefreshRouteHandler,
  type RefreshRouteHandlerOptions,
} from "./refresh-handler";

// Middleware Factory
export {
  createAuthMiddleware,
  isJwtExpired,
  type AuthMiddlewareOptions,
} from "./middleware";
