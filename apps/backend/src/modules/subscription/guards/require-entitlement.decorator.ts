import { SetMetadata } from "@nestjs/common";

export const REQUIRE_ENTITLEMENT_KEY = "require_entitlement";

/**
 * Declares that an endpoint requires the organization to possess a specific boolean feature entitlement.
 * Evaluated by `SubscriptionEntitlementGuard`.
 */
export const RequireEntitlement = (featureCode: string) => SetMetadata(REQUIRE_ENTITLEMENT_KEY, featureCode);
