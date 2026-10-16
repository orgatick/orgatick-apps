import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, In, IsNull, Repository } from "typeorm";
import { DEFAULT_ROLE_KEYS } from "../../../../common/authorization/roles/default-roles";
import { Permission } from "../../../../common/authorization/entities/permission.entity";
import { Role } from "../../../../common/authorization/entities/role.entity";

import { normalizeEmail } from "../../../../common/utils/email.util";
import { User } from "../../../users/entities/user.entity";
import { OrganizationInvitation } from "../../organization-invitation/entities/organization-invitation.entity";
import { OrganizationInvitationStatus } from "../../organization-invitation/enums/organization-invitation-status.enum";
import { OrganizationMember } from "../entities/organization-member.entity";
import { OrganizationMemberStatus } from "../enums/organization-member-status.enum";

@Injectable()
export class OrganizationMemberRepository extends Repository<OrganizationMember> {
  constructor(dataSource: DataSource) {
    super(OrganizationMember, dataSource.createEntityManager());
  }

  async findRoleIdByKey(organizationId: bigint, key: string): Promise<bigint | null> {
    const orgRole = await this.manager.findOne(Role, {
      where: { organizationId, key },
    });
    if (orgRole) return orgRole.id;

    const globalRole = await this.manager.findOne(Role, {
      where: { organizationId: IsNull(), key },
    });
    return globalRole ? globalRole.id : null;
  }

  async findRoleByKey(organizationId: bigint, key: string): Promise<Role | null> {
    const orgRole = await this.manager.findOne(Role, {
      where: { organizationId, key },
    });
    if (orgRole) return orgRole;

    return await this.manager.findOne(Role, {
      where: { organizationId: IsNull(), key },
    });
  }

  async findOwnerRoleId(organizationId: bigint): Promise<bigint | null> {
    return this.findRoleIdByKey(organizationId, DEFAULT_ROLE_KEYS.OWNER);
  }

  createOwnerMember(organizationId: bigint, userId: bigint, roleId: bigint): OrganizationMember {
    return this.create({
      organizationId,
      userId,
      roleId,
      status: OrganizationMemberStatus.ACTIVE,
      joinedAt: new Date(),
    } satisfies DeepPartial<OrganizationMember>);
  }

  async findByOrgAndUser(organizationId: bigint, userId: bigint): Promise<OrganizationMember | null> {
    return this.findOne({
      where: { organizationId, userId },
      relations: { user: true, organization: true, role: true },
    });
  }

  async findActiveMembership(organizationId: bigint, userId: bigint): Promise<OrganizationMember | null> {
    return this.findOne({
      where: { organizationId, userId, status: OrganizationMemberStatus.ACTIVE },
      relations: { organization: true, role: true },
    });
  }

  async findActiveMembershipsByUser(userId: bigint): Promise<OrganizationMember[]> {
    return this.find({
      where: { userId, status: OrganizationMemberStatus.ACTIVE },
      relations: { organization: true, role: true },
      order: { createdAt: "DESC" },
    });
  }

  async findActiveMembersByOrg(organizationId: bigint): Promise<OrganizationMember[]> {
    return this.find({
      where: { organizationId, status: OrganizationMemberStatus.ACTIVE },
      relations: { user: true, role: true },
      order: { createdAt: "ASC" },
    });
  }

  async findUserActiveMemberships(userId: bigint): Promise<OrganizationMember[]> {
    return this.find({
      where: { userId, status: OrganizationMemberStatus.ACTIVE },
      relations: {
        role: true,
        organization: {
          category: true,
          subCategory: true,
          address: true,
          stats: true,
          verification: true,
        },
      },
      order: { createdAt: "DESC" },
    });
  }

  async searchMembers(
    organizationId: bigint,
    options: { q?: string; status?: string } = {},
  ): Promise<OrganizationMember[]> {
    const queryBuilder = this.createQueryBuilder("member")
      .leftJoinAndSelect("member.user", "user")
      .leftJoinAndSelect("member.role", "role")
      .where("member.organization_id = :organizationId", { organizationId: organizationId.toString() })
      .orderBy("member.created_at", "ASC");

    if (options.status) {
      queryBuilder.andWhere("member.status = :status", { status: options.status });
    }

    const q = options.q?.trim();
    if (q) {
      queryBuilder.andWhere("(user.name ILIKE :q OR user.email ILIKE :q)", { q: `%${q}%` });
    }

    return await queryBuilder.getMany();
  }

  async findAvailableRoles(organizationId: bigint): Promise<Role[]> {
    return await this.manager.find(Role, {
      where: [
        { organizationId, isActive: true },
        { organizationId: IsNull(), isActive: true },
      ],
      relations: { permissions: true },
      order: { name: "ASC" },
    });
  }

  async getAvailablePermissions(): Promise<Permission[]> {
    return await this.manager.find(Permission, {
      where: {
        scope: In(["organization", "event"]),
        isActive: true,
      },
      order: {
        category: "ASC",
        name: "ASC",
      },
    });
  }

  async getDetailedRoles(organizationId: bigint) {
    const roles = await this.manager.find(Role, {
      where: [
        { organizationId, isActive: true },
        { organizationId: IsNull(), isActive: true },
      ],
      relations: { permissions: true },
      order: { name: "ASC" },
    });

    const memberCounts = await this.createQueryBuilder("member")
      .select("member.role_id", "roleId")
      .addSelect("COUNT(member.id)", "count")
      .where("member.organization_id = :organizationId", { organizationId: organizationId.toString() })
      .andWhere("member.status = :status", { status: OrganizationMemberStatus.ACTIVE })
      .groupBy("member.role_id")
      .getRawMany<{ roleId: string; count: string }>();

    const countMap = new Map<string, number>();
    for (const mc of memberCounts) {
      countMap.set(mc.roleId, Number.parseInt(mc.count, 10));
    }

    return roles.map((role) => {
      const roleIdStr = role.id.toString();
      return {
        id: roleIdStr,
        key: role.key,
        name: role.name,
        description: role.description ?? null,
        isCustom: role.organizationId !== null && role.organizationId !== undefined,
        memberCount: countMap.get(roleIdStr) ?? 0,
        permissions: (role.permissions ?? []).filter((p) => p.isActive).map((p) => p.key),
        createdAt: role.createdAt ? role.createdAt.toISOString() : undefined,
      };
    });
  }

  async findCustomRoleById(organizationId: bigint, roleId: bigint): Promise<Role | null> {
    return await this.manager.findOne(Role, {
      where: { id: roleId, organizationId },
      relations: { permissions: true },
    });
  }

  async countMembersWithRole(organizationId: bigint, roleId: bigint): Promise<number> {
    return await this.count({
      where: { organizationId, roleId },
    });
  }

  async findMembersWithRole(organizationId: bigint, roleId: bigint): Promise<OrganizationMember[]> {
    return await this.find({
      where: { organizationId, roleId },
      select: { userId: true },
    });
  }

  async findActiveMemberByEmail(organizationId: bigint, normalizedEmail: string): Promise<OrganizationMember | null> {
    return await this.createQueryBuilder("member")
      .innerJoinAndSelect("member.user", "user")
      .innerJoinAndSelect("member.role", "role")
      .where("member.organization_id = :organizationId", { organizationId: organizationId.toString() })
      .andWhere("member.status = :status", { status: OrganizationMemberStatus.ACTIVE })
      .andWhere("user.normalized_email = :normalizedEmail", { normalizedEmail })
      .getOne();
  }

  async searchCandidateUsers(
    organizationId: bigint,
    options: { q?: string; limit?: number } = {},
  ): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      isMember: boolean;
      isInvited: boolean;
    }>
  > {
    const q = options.q?.trim();
    const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);

    const qb = this.manager
      .createQueryBuilder(User, "user")
      .select(["user.id", "user.name", "user.email", "user.normalizedEmail", "user.avatar"]);

    if (q) {
      qb.where("user.name ILIKE :q OR user.email ILIKE :q", { q: `%${q}%` });
    }

    qb.orderBy("user.name", "ASC").take(limit);

    const users = await qb.getMany();
    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((u) => BigInt(u.id));
    const activeMembers = await this.createQueryBuilder("member")
      .where("member.organization_id = :organizationId", { organizationId: organizationId.toString() })
      .andWhere("member.user_id IN (:...userIds)", { userIds })
      .andWhere("member.status = :status", { status: OrganizationMemberStatus.ACTIVE })
      .getMany();

    const memberUserIds = new Set(activeMembers.map((m) => m.userId.toString()));

    const normalizedEmails = users.map((u) => u.normalizedEmail || normalizeEmail(u.email));
    const pendingInvites = await this.manager
      .getRepository(OrganizationInvitation)
      .createQueryBuilder("invitation")
      .where("invitation.organization_id = :organizationId", { organizationId: organizationId.toString() })
      .andWhere("invitation.email IN (:...normalizedEmails)", { normalizedEmails })
      .andWhere("invitation.status = :status", { status: OrganizationInvitationStatus.PENDING })
      .getMany();

    const pendingEmails = new Set(pendingInvites.map((i) => i.email.toLowerCase()));

    return users.map((u) => {
      const email = u.email;
      const normalized = (u.normalizedEmail || normalizeEmail(email)).toLowerCase();
      return {
        id: u.id.toString(),
        name: u.name,
        email,
        avatar: u.avatar ?? null,
        isMember: memberUserIds.has(u.id.toString()),
        isInvited: pendingEmails.has(normalized),
      };
    });
  }
}
