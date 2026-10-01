import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { membershipCacheKey } from "../../context/constants/organization-context.constants";
import type { OrganizationMember } from "../entities/organization-member.entity";
import { OrganizationMemberRepository } from "../repositories/member.repository";

@Injectable()
export class OrganizationMemberService {
  constructor(
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async addOwner(organizationId: bigint, userId: bigint): Promise<OrganizationMember> {
    const roleId = await this.memberRepository.findOwnerRoleId(organizationId);
    if (roleId === null) {
      throw new NotFoundException("Owner role not found. Ensure system-generated default roles are seeded.");
    }
    const member = await this.memberRepository.save(
      this.memberRepository.createOwnerMember(organizationId, userId, roleId),
    );
    await this.invalidateMembershipCache(userId, organizationId);
    return member;
  }

  async invalidateMembershipCache(userId: bigint, organizationId: bigint): Promise<void> {
    try {
      await this.cacheManager.del(membershipCacheKey(userId, organizationId));
    } catch {
      // Redis is an optimization layer only. A failed delete is ignored.
    }
  }

  async getOrganizationMembers(organizationId: bigint): Promise<OrganizationMember[]> {
    return await this.memberRepository.findActiveMembersByOrg(organizationId);
  }

  async getUserMemberships(userId: bigint): Promise<OrganizationMember[]> {
    return await this.memberRepository.findUserActiveMemberships(userId);
  }

  async getMember(organizationId: bigint, userId: bigint): Promise<OrganizationMember> {
    const member = await this.memberRepository.findByOrgAndUser(organizationId, userId);
    if (!member) {
      throw new NotFoundException("Organization member not found");
    }
    return member;
  }
}
