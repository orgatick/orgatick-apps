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

  /**
   * Automatically picks the user's default active organization when cookie is missing.
   * Prioritizes highest role first, then earliest membership.
   */
  async resolveDefaultContext(
    userId: bigint,
  ): Promise<{ context: OrganizationContext; organizationId: bigint } | null> {
    const memberships = await this.memberRepository.findActiveMembershipsByUser(userId);
    if (!memberships || memberships.length === 0) return null;

    const preferred = memberships.reduce<OrganizationMember | null>((best, current) => {
      if (!best) return current;
      const priority = (m: OrganizationMember) => {
        const key = m.role?.key?.toLowerCase() ?? "";
        if (key === "owner") return 0;
        if (key === "admin") return 1;
        if (key === "event_manager") return 2;
        if (key === "volunteer") return 3;
        return 99;
      };
      if (priority(current) !== priority(best)) {
        return priority(current) < priority(best) ? current : best;
      }
      return current.createdAt < best.createdAt ? current : best;
    }, null);

    if (!preferred) return null;

    const organizationId = BigInt(preferred.organizationId);
    const context = await this.warmMembershipCache(userId, organizationId, preferred);
    return { context, organizationId };
  }
}
