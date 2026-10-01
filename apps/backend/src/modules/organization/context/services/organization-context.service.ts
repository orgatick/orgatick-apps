import { Injectable } from "@nestjs/common";
import type { OrganizationMember } from "../../organization-member/entities/organization-member.entity";
import { OrganizationMemberRepository } from "../../organization-member/repositories/member.repository";
import type { OrganizationContext } from "../types/organization-context.types";
import { OrganizationContextCacheService } from "./organization-context-cache.service";

@Injectable()
export class OrganizationContextService {
  constructor(
    private readonly cacheService: OrganizationContextCacheService,
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  /**
   * Resolves the active membership of `userId` in `organizationId`.
   * Checks the Redis cache first and only falls back to PostgreSQL on a cache miss.
   * Returns null when the organization does not exist, the user is not a member,
   * or the membership is not active. Never trusts the cookie value on its own.
   */
  async resolveContext(userId: bigint, organizationId: bigint): Promise<OrganizationContext | null> {
    const cached = await this.cacheService.get(userId, organizationId);
    if (cached) return cached;

    const membership = await this.memberRepository.findActiveMembership(organizationId, userId);
    if (!membership) return null;

    return await this.warmMembershipCache(userId, organizationId, membership);
  }

  async warmMembershipCache(
    userId: bigint,
    organizationId: bigint,
    membership: OrganizationMember,
  ): Promise<OrganizationContext> {
    const context: OrganizationContext = {
      organizationId,
      membershipId: BigInt(membership.id),
      roleId: BigInt(membership.roleId),
    };
    await this.cacheService.set(userId, organizationId, context);
    return context;
  }

  /**
   * Invalidates the cached membership for `userId` + `organizationId`.
   * Call whenever a membership is created, disabled, removed, restored, or its role changes.
   */
  async invalidateMembershipCache(userId: bigint, organizationId: bigint): Promise<void> {
    await this.cacheService.invalidate(userId, organizationId);
  }
}
