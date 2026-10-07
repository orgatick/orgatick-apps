import { Injectable } from "@nestjs/common";
import { Role } from "../../../../common/authorization/entities/role.entity";
import { OrganizationMemberRepository } from "../repositories/member.repository";

@Injectable()
export class OrganizationPermissionService {
  constructor(private readonly memberRepository: OrganizationMemberRepository) {}

  async getEffectiveRole(userId: bigint, organizationId: bigint): Promise<Role | null> {
    const membership = await this.memberRepository.findActiveMembership(organizationId, userId);
    if (!membership) return null;

    return await this.memberRepository.manager.findOne(Role, {
      where: { id: membership.roleId },
      relations: { permissions: true },
    });
  }

  async getEffectivePermissions(userId: bigint, organizationId: bigint): Promise<string[]> {
    const role = await this.getEffectiveRole(userId, organizationId);
    if (!role?.permissions) return [];

    return role.permissions.filter((permission) => permission.isActive).map((permission) => permission.key);
  }
}
