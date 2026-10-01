import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, IsNull, Repository } from "typeorm";
import { DEFAULT_ROLE_KEYS } from "../../../../common/authorization/roles/default-roles";
import { Role } from "../../../../common/authorization/entities/role.entity";
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
}
