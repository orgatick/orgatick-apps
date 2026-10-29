import {
  type CookieStoreLike,
  type ParsedSetCookie,
  createServerApi,
  createServerApiClient,
  isRedirectError,
  mergeCookieHeader,
  parseSetCookieHeader,
  resolveCookieDomain,
  serverApi,
} from "@orgatick/auth";

export {
  type CookieStoreLike,
  type ParsedSetCookie,
  serverApi,
  serverApi as default,
  createServerApi,
  createServerApiClient,
  isRedirectError,
  mergeCookieHeader,
  parseSetCookieHeader,
  resolveCookieDomain,
};
