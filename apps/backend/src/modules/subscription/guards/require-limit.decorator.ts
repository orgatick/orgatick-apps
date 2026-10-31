import { SetMetadata } from "@nestjs/common";

export const REQUIRE_LIMIT_KEY = "require_limit";

export interface RequireLimitOptions {
  limitCode: string;
  requested?: number;
}

/**
 * Declares that an endpoint consumes capacity against a metered or concurrent organization limit.
 * Evaluated by `SubscriptionLimitGuard`.
 */
export const RequireLimit = (limitCode: string, requested = 1) =>
  SetMetadata(REQUIRE_LIMIT_KEY, { limitCode, requested } as RequireLimitOptions);
