import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { In } from "typeorm";
import { Permission } from "../../../../common/authorization/entities/permission.entity";
import { RolePermission } from "../../../../common/authorization/entities/role-permission.entity";
import { Role } from "../../../../common/authorization/entities/role.entity";
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

  async findActiveMembership(organizationId: bigint, userId: bigint): Promise<OrganizationMember | null> {
    return await this.memberRepository.findActiveMembership(organizationId, userId);
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

  async searchCandidateUsers(organizationId: bigint, options: { q?: string; limit?: number } = {}) {
    return await this.memberRepository.searchCandidateUsers(organizationId, options);
  }

  async getAvailableRoles(organizationId: bigint) {
    return await this.memberRepository.findAvailableRoles(organizationId);
  }

  async getDetailedRoles(organizationId: bigint) {
    return await this.memberRepository.getDetailedRoles(organizationId);
  }

  async getAvailablePermissions() {
    const permissions = await this.memberRepository.getAvailablePermissions();
    return permissions.map((p) => ({
      id: p.id.toString(),
      key: p.key,
      name: p.name,
      description: p.description ?? null,
      category: p.category,
      resource: p.resource,
      action: p.action,
    }));
  }

  async createCustomRole(
    organizationId: bigint,
    dto: { name: string; description?: string | null; permissions: string[] },
  ) {
    const trimmedName = dto.name.trim();
    const baseSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50);

    if (!baseSlug) {
      throw new BadRequestException("Role name contains no valid alphanumeric characters.");
    }

    if (baseSlug === "owner") {
      throw new BadRequestException("The 'owner' role is reserved and cannot be created.");
    }

    let key = baseSlug;
    const existingRoleWithKey = await this.memberRepository.manager.findOne(Role, {
      where: { organizationId, key },
    });
    if (existingRoleWithKey) {
      key = `${baseSlug}_${Math.random().toString(36).slice(2, 6)}`;
    }

    const validPermissions = await this.memberRepository.manager.find(Permission, {
      where: {
        key: In(dto.permissions),
        scope: In(["organization", "event"]),
        isActive: true,
      },
    });

    if (validPermissions.length === 0) {
      throw new BadRequestException("Please select at least one valid organization or event permission.");
    }

    const newRole = await this.memberRepository.manager.save(
      Role,
      this.memberRepository.manager.create(Role, {
        organizationId,
        key,
        name: trimmedName,
        description: dto.description?.trim() || null,
        isActive: true,
      }),
    );

    const rolePermissions = validPermissions.map((permission) =>
      this.memberRepository.manager.create(RolePermission, {
        roleId: newRole.id,
        permissionId: permission.id,
      }),
    );
    await this.memberRepository.manager.save(RolePermission, rolePermissions);

    return {
      id: newRole.id.toString(),
      key: newRole.key,
      name: newRole.name,
      description: newRole.description ?? null,
      isCustom: true,
      memberCount: 0,
      permissions: validPermissions.map((p) => p.key),
      createdAt: newRole.createdAt.toISOString(),
    };
  }

  async updateCustomRole(
    organizationId: bigint,
    roleId: bigint,
    dto: { name?: string; description?: string | null; permissions?: string[] },
  ) {
    const role = await this.memberRepository.findCustomRoleById(organizationId, roleId);
    if (!role) {
      throw new NotFoundException("Custom role not found in this organization or is a system default role.");
    }

    if (dto.name) {
      role.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      role.description = dto.description?.trim() || null;
    }
    await this.memberRepository.manager.save(Role, role);

    if (dto.permissions) {
      const validPermissions = await this.memberRepository.manager.find(Permission, {
        where: {
          key: In(dto.permissions),
          scope: In(["organization", "event"]),
          isActive: true,
        },
      });

      if (validPermissions.length === 0) {
        throw new BadRequestException("Please select at least one valid organization or event permission.");
      }

      await this.memberRepository.manager.delete(RolePermission, { roleId: role.id });
      const rolePermissions = validPermissions.map((permission) =>
        this.memberRepository.manager.create(RolePermission, {
          roleId: role.id,
          permissionId: permission.id,
        }),
      );
      await this.memberRepository.manager.save(RolePermission, rolePermissions);
    }

    const assignedMembers = await this.memberRepository.findMembersWithRole(organizationId, role.id);
    for (const member of assignedMembers) {
      await this.invalidateMembershipCache(member.userId, organizationId);
    }

    const updated = await this.memberRepository.findCustomRoleById(organizationId, role.id);
    const memberCount = await this.memberRepository.countMembersWithRole(organizationId, role.id);

    return {
      id: role.id.toString(),
      key: role.key,
      name: role.name,
      description: role.description ?? null,
      isCustom: true,
      memberCount,
      permissions: (updated?.permissions ?? []).filter((p) => p.isActive).map((p) => p.key),
      createdAt: role.createdAt ? role.createdAt.toISOString() : undefined,
    };
  }

  async deleteCustomRole(organizationId: bigint, roleId: bigint): Promise<{ id: string; deleted: boolean }> {
    const role = await this.memberRepository.findCustomRoleById(organizationId, roleId);
    if (!role) {
      throw new NotFoundException("Custom role not found in this organization or is a system default role.");
    }

    const memberCount = await this.memberRepository.countMembersWithRole(organizationId, role.id);
    if (memberCount > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because ${memberCount} member(s) are currently assigned to it. Reassign those members first.`,
      );
    }

    const pendingInviteCount = await this.memberRepository.manager.getRepository(OrganizationInvitation).count({
      where: {
        organizationId,
        role: role.key,
        status: OrganizationInvitationStatus.PENDING,
      },
    });
    if (pendingInviteCount > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because ${pendingInviteCount} pending invitation(s) use it. Revoke or update those invitations first.`,
      );
    }

    await this.memberRepository.manager.delete(RolePermission, { roleId: role.id });
    await this.memberRepository.manager.remove(Role, role);

    return { id: role.id.toString(), deleted: true };
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
