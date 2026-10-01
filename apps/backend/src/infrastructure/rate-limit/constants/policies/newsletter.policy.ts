import type { RateLimitPolicy } from "../../types/rate-limit.types";
import { RateLimitExtractors } from "../../utils/extractors.util";

export const NEWSLETTER_RATE_LIMIT_POLICIES = {
  /** Public subscribe attempts per IP (5 requests per 10 minutes). */
  subscribe: {
    limit: 5,
    windowSeconds: 600,
    keyPrefix: "newsletter:subscribe:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many subscribe attempts from this IP. Please try again in a few minutes.",
  } satisfies RateLimitPolicy,

  /** Public subscribe attempts per address (5 requests per 10 minutes). */
  subscribeAccount: {
    limit: 5,
    windowSeconds: 600,
    keyPrefix: "newsletter:subscribe:account",
    extractors: [RateLimitExtractors.emailFromBody("email")],
    message: "Too many subscribe attempts for this email address. Please try again later.",
  } satisfies RateLimitPolicy,

  /** Public unsubscribe / preferences calls per IP (20 requests per 10 minutes). */
  selfService: {
    limit: 20,
    windowSeconds: 600,
    keyPrefix: "newsletter:self_service:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many requests. Please wait a few minutes before trying again.",
  } satisfies RateLimitPolicy,

  /** Double opt-in confirmations per IP (10 requests per hour). */
  confirm: {
    limit: 10,
    windowSeconds: 3600,
    keyPrefix: "newsletter:confirm:ip",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many confirmation attempts. Please try again later.",
  } satisfies RateLimitPolicy,

  /** Campaign dispatch / send actions per authenticated admin (10 requests per minute). */
  dispatch: {
    limit: 10,
    windowSeconds: 60,
    keyPrefix: "newsletter:dispatch:user",
    extractors: [RateLimitExtractors.userOrIp()],
    message: "Too many send operations in a row. Please wait a minute.",
  } satisfies RateLimitPolicy,

  /** Campaign send throughput, shared by every replica through the dispatch lock. */
  dispatchThroughput: {
    limit: 200,
    windowSeconds: 60,
    keyPrefix: "newsletter:dispatch:throughput",
    extractors: [RateLimitExtractors.custom(() => "global")],
    message: "Newsletter send throughput limit reached. Retrying shortly.",
  } satisfies RateLimitPolicy,
} as const;
