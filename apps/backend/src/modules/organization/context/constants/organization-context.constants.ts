export const CURRENT_ORGANIZATION_COOKIE_NAME = "current_organization_id";
export const CURRENT_ORGANIZATION_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS = 300_000;

export function membershipCacheKey(userId: bigint | string | number, organizationId: bigint | string | number): string {
  return `organization:membership:${userId}:${organizationId}`;
}
