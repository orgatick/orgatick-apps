import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { normalizeEmail } from "../../../../common/utils/email.util";
import { User } from "../../../users/entities/user.entity";
import { membershipCacheKey } from "../../context/constants/organization-context.constants";
import { OrganizationInvitation } from "../../organization-invitation/entities/organization-invitation.entity";
import { OrganizationInvitationStatus } from "../../organization-invitation/enums/organization-invitation-status.enum";
import type { OrganizationMember } from "../entities/organization-member.entity";
import { OrganizationMemberStatus } from "../enums/organization-member-status.enum";
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

  async listMembers(
    organizationId: bigint,
    query: { q?: string; status?: string } = {},
  ): Promise<OrganizationMember[]> {
    return await this.memberRepository.searchMembers(organizationId, query);
  }

  async getAvailableRoles(organizationId: bigint) {
    return await this.memberRepository.findAvailableRoles(organizationId);
  }

  private async activeOwnerCount(organizationId: bigint): Promise<number> {
    const ownerRoleId = await this.memberRepository.findOwnerRoleId(organizationId);
    if (ownerRoleId === null) return 0;
    return await this.memberRepository.count({
      where: {
        organizationId,
        roleId: ownerRoleId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
  }

  private async isLastActiveOwner(organizationId: bigint, member: OrganizationMember): Promise<boolean> {
    const ownerRoleId = await this.memberRepository.findOwnerRoleId(organizationId);
    if (ownerRoleId === null || member.roleId !== ownerRoleId) return false;
    return (await this.activeOwnerCount(organizationId)) <= 1;
  }

  async changeRole(organizationId: bigint, memberId: bigint, roleKey: string): Promise<OrganizationMember> {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) {
      throw new NotFoundException("Organization member not found");
    }

    const newRoleId = await this.memberRepository.findRoleIdByKey(organizationId, roleKey);
    if (newRoleId === null) {
      throw new NotFoundException(`Role "${roleKey}" not found`);
    }

    if (member.roleId !== newRoleId && (await this.isLastActiveOwner(organizationId, member))) {
      throw new ConflictException("Cannot demote the last active owner. Transfer ownership first.");
    }

    member.roleId = newRoleId;
    await this.memberRepository.save(member);
    await this.invalidateMembershipCache(member.userId, organizationId);

    return (
      (await this.memberRepository.findOne({ where: { id: member.id }, relations: { user: true, role: true } })) ??
      member
    );
  }

  async changeStatus(
    organizationId: bigint,
    memberId: bigint,
    status: OrganizationMemberStatus,
  ): Promise<OrganizationMember> {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) {
      throw new NotFoundException("Organization member not found");
    }

    if (status !== OrganizationMemberStatus.ACTIVE && (await this.isLastActiveOwner(organizationId, member))) {
      throw new ConflictException("Cannot suspend the last active owner. Transfer ownership first.");
    }

    member.status = status;
    if (status === OrganizationMemberStatus.ACTIVE && !member.joinedAt) {
      member.joinedAt = new Date();
    }
    await this.memberRepository.save(member);
    await this.invalidateMembershipCache(member.userId, organizationId);

    return (
      (await this.memberRepository.findOne({ where: { id: member.id }, relations: { user: true, role: true } })) ??
      member
    );
  }

  async removeMember(organizationId: bigint, memberId: bigint): Promise<{ id: string; removed: boolean }> {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) {
      throw new NotFoundException("Organization member not found");
    }

    if (await this.isLastActiveOwner(organizationId, member)) {
      throw new ConflictException("Cannot remove the last active owner. Transfer ownership first.");
    }

    await this.memberRepository.remove(member);
    await this.invalidateMembershipCache(member.userId, organizationId);

    return { id: member.id.toString(), removed: true };
  }

  async addMemberByEmail(organizationId: bigint, input: { email: string; role: string }): Promise<OrganizationMember> {
    const role = await this.memberRepository.findRoleByKey(organizationId, input.role);
    if (!role) {
      throw new NotFoundException(`Role "${input.role}" not found`);
    }

    const normalizedEmail = normalizeEmail(input.email);
    const user = await this.memberRepository.manager.findOne(User, {
      where: { normalizedEmail },
    });
    if (!user) {
      throw new NotFoundException("No registered user found with this email. Please send an invitation instead.");
    }

    const userId = BigInt(user.id);
    let member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });
    if (member?.status === OrganizationMemberStatus.ACTIVE) {
      throw new ConflictException("This user is already an active member of this organization");
    }

    if (member) {
      member.roleId = role.id;
      member.status = OrganizationMemberStatus.ACTIVE;
      member.joinedAt = member.joinedAt ?? new Date();
      member = await this.memberRepository.save(member);
    } else {
      member = await this.memberRepository.save(
        this.memberRepository.create({
          organizationId,
          userId,
          roleId: role.id,
          status: OrganizationMemberStatus.ACTIVE,
          joinedAt: new Date(),
        }),
      );
    }

    await this.invalidateMembershipCache(userId, organizationId);

    await this.memberRepository.manager
      .createQueryBuilder()
      .update(OrganizationInvitation)
      .set({ status: OrganizationInvitationStatus.ACCEPTED, acceptedAt: new Date() })
      .where("organization_id = :organizationId", { organizationId: organizationId.toString() })
      .andWhere("email = :normalizedEmail", { normalizedEmail })
      .andWhere("status = :status", { status: OrganizationInvitationStatus.PENDING })
      .execute();

    return (
      (await this.memberRepository.findOne({
        where: { id: member.id },
        relations: { user: true, role: true },
      })) ?? member
    );
  }
}
