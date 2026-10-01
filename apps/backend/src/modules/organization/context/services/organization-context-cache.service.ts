import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { membershipCacheKey, ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS } from "../constants/organization-context.constants";
import type { CachedOrganizationMembership, OrganizationContext } from "../types/organization-context.types";

@Injectable()
export class OrganizationContextCacheService {
  private readonly ttlMs: number;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    configService: ConfigService,
  ) {
    this.ttlMs = configService.get<number>(
      "ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS",
      ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS,
    );
  }

  async get(userId: bigint, organizationId: bigint): Promise<OrganizationContext | null> {
    try {
      const cached = await this.cacheManager.get<CachedOrganizationMembership>(
        membershipCacheKey(userId, organizationId),
      );
      if (!cached) return null;
      return {
        membershipId: BigInt(cached.membershipId),
        organizationId: BigInt(cached.organizationId),
        roleId: BigInt(cached.roleId),
      };
    } catch {
      return null;
    }
  }

  async set(userId: bigint, organizationId: bigint, context: OrganizationContext): Promise<void> {
    try {
      const value: CachedOrganizationMembership = {
        membershipId: context.membershipId.toString(),
        organizationId: context.organizationId.toString(),
        roleId: context.roleId.toString(),
      };
      await this.cacheManager.set(membershipCacheKey(userId, organizationId), value, this.ttlMs);
    } catch {
      // Redis is an optimization layer only. A failed write is ignored.
    }
  }

  async invalidate(userId: bigint, organizationId: bigint): Promise<void> {
    try {
      await this.cacheManager.del(membershipCacheKey(userId, organizationId));
    } catch {
      // Redis is an optimization layer only. A failed delete is ignored.
    }
  }
}
