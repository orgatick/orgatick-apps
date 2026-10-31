import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { OrganizationEffectiveEntitlements } from "@orgatick/contracts";

@Injectable()
export class EntitlementCacheService {
  private readonly logger = new Logger(EntitlementCacheService.name);
  private readonly ttlMs = 3600 * 1000; // 1 hour

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private getCacheKey(organizationId: bigint): string {
    return `org:entitlements:${organizationId.toString()}`;
  }

  async get(organizationId: bigint): Promise<OrganizationEffectiveEntitlements | null> {
    try {
      const cached = await this.cacheManager.get<OrganizationEffectiveEntitlements>(this.getCacheKey(organizationId));
      return cached ?? null;
    } catch (error) {
      this.logger.warn(`Redis get failed for org ${organizationId}: ${(error as Error).message}`);
      return null;
    }
  }

  async set(organizationId: bigint, entitlements: OrganizationEffectiveEntitlements): Promise<void> {
    try {
      await this.cacheManager.set(this.getCacheKey(organizationId), entitlements, this.ttlMs);
    } catch (error) {
      this.logger.warn(`Redis set failed for org ${organizationId}: ${(error as Error).message}`);
    }
  }

  async invalidate(organizationId: bigint): Promise<void> {
    try {
      await this.cacheManager.del(this.getCacheKey(organizationId));
      this.logger.debug(`Evicted entitlement cache for org ${organizationId}`);
    } catch (error) {
      this.logger.warn(`Redis del failed for org ${organizationId}: ${(error as Error).message}`);
    }
  }
}
