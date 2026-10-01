import { SetMetadata } from "@nestjs/common";
import { RATE_LIMIT_METADATA, SKIP_RATE_LIMIT_METADATA } from "../constants/rate-limit.constants";
import type { RateLimitPolicy } from "../types/rate-limit.types";

/** Applies one or more rate limit policies to a controller handler or controller class. */
export function RateLimit(policyOrPolicies: RateLimitPolicy | RateLimitPolicy[]): MethodDecorator & ClassDecorator {
  const policies = Array.isArray(policyOrPolicies) ? policyOrPolicies : [policyOrPolicies];
  return SetMetadata(RATE_LIMIT_METADATA, policies);
}

/** Bypasses all rate limiting on the decorated handler or class (including global rate limit). */
export function SkipRateLimit(): MethodDecorator & ClassDecorator {
  return SetMetadata(SKIP_RATE_LIMIT_METADATA, true);
}
