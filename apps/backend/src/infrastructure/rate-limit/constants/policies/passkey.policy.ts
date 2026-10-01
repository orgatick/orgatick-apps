import type { RateLimitPolicy } from "../../types/rate-limit.types";
import { RateLimitExtractors } from "../../utils/extractors.util";

export const PASSKEY_RATE_LIMIT_POLICIES = {
  /** Passkey authentication ceremonies (10 requests per 1 minute). */
  auth: {
    limit: 10,
    windowSeconds: 60,
    keyPrefix: "passkey_auth",
    extractors: [RateLimitExtractors.ip()],
    message: "Too many passkey authentication attempts. Please try again shortly.",
  } satisfies RateLimitPolicy,

  /** Passkey registration ceremonies (5 requests per 15 minutes). */
  register: {
    limit: 5,
    windowSeconds: 900,
    keyPrefix: "passkey_reg",
    extractors: [RateLimitExtractors.userOrIp()],
    message: "Too many passkey registration attempts. Please wait 15 minutes.",
  } satisfies RateLimitPolicy,
} as const;
