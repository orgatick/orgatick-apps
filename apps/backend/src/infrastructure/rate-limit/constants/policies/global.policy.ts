import type { RateLimitPolicy } from "../../types/rate-limit.types";
import { RateLimitExtractors } from "../../utils/extractors.util";

export const GLOBAL_RATE_LIMIT_POLICIES = {
  /** Global rate limit for all general API endpoints (100 requests per 1 minute). */
  global: {
    limit: 100,
    windowSeconds: 60,
    keyPrefix: "global",
    extractors: [RateLimitExtractors.userOrIp()],
    message: "Too many requests. Please slow down.",
  } satisfies RateLimitPolicy,
} as const;
