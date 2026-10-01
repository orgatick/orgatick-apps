import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { OrganizationMemberRepository } from "../../organization-member";
import { User } from "@/modules/users/entities/user.entity";
import { OrganizationMemberStatus } from "@orgatick/contracts";
import { DEFAULT_ROLE_KEYS, Role } from "@/common/authorization";

@Injectable()
export class AdminMemberService {
  constructor(
    private readonly memberRepository: OrganizationMemberRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listMembers(organizationId: bigint) {
    return this.memberRepository.find({
      where: { organizationId },
      relations: { user: true, role: true },
      order: { joinedAt: "ASC" },
    });
  }

  private async activeOwnerCount(organizationId: bigint): Promise<number> {
    const ownerRoleId = await this.memberRepository.findOwnerRoleId(organizationId);
    if (ownerRoleId === null) return 0;
    return this.memberRepository.count({
      where: {
        organizationId,
        roleId: ownerRoleId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
  }

  private async ensureUserExists(userId: bigint) {
    const user = await this.userRepository.findOneBy({ id: Number(userId) });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async addMember(organizationId: bigint, userId: bigint, roleKey: string) {
    await this.ensureUserExists(userId);

    const existing = await this.memberRepository.findOneBy({ organizationId, userId });
    if (existing) throw new ConflictException("User is already a member of this organization");

    const roleId = await this.memberRepository.findRoleIdByKey(organizationId, roleKey);
    if (roleId === null) throw new NotFoundException(`Role "${roleKey}" not found`);

    const member = await this.memberRepository.save(
      this.memberRepository.create({
        organizationId,
        userId,
        roleId,
        status: OrganizationMemberStatus.ACTIVE,
        joinedAt: new Date(),
      }),
    );
    return this.memberRepository.findOne({ where: { id: member.id }, relations: { user: true, role: true } });
  }

  async changeRole(organizationId: bigint, memberId: bigint, roleKey: string) {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) throw new NotFoundException("Member not found");

    const newRoleId = await this.memberRepository.findRoleIdByKey(organizationId, roleKey);
    if (newRoleId === null) throw new NotFoundException(`Role "${roleKey}" not found`);

    const role = await this.memberRepository.manager.findOneBy(Role, { id: member.roleId });
    if (role?.key === DEFAULT_ROLE_KEYS.OWNER && roleKey !== DEFAULT_ROLE_KEYS.OWNER) {
      if ((await this.activeOwnerCount(organizationId)) <= 1) {
        throw new ConflictException("Cannot demote the last active owner. Transfer ownership first.");
      }
    }

    member.roleId = newRoleId;
    await this.memberRepository.save(member);
    return this.memberRepository.findOne({ where: { id: member.id }, relations: { user: true, role: true } });
  }

  async changeStatus(organizationId: bigint, memberId: bigint, status: OrganizationMemberStatus) {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) throw new NotFoundException("Member not found");

    const role = await this.memberRepository.manager.findOneBy(Role, { id: member.roleId });
    if (role?.key === DEFAULT_ROLE_KEYS.OWNER && status === OrganizationMemberStatus.INACTIVE) {
      if ((await this.activeOwnerCount(organizationId)) <= 1) {
        throw new ConflictException("Cannot suspend the last active owner. Transfer ownership first.");
      }
    }

    member.status = status;
    await this.memberRepository.save(member);
    return this.memberRepository.findOne({ where: { id: member.id }, relations: { user: true, role: true } });
  }

  async removeMember(organizationId: bigint, memberId: bigint) {
    const member = await this.memberRepository.findOneBy({ id: memberId, organizationId });
    if (!member) throw new NotFoundException("Member not found");

    const role = await this.memberRepository.manager.findOneBy(Role, { id: member.roleId });
    if (role?.key === DEFAULT_ROLE_KEYS.OWNER && (await this.activeOwnerCount(organizationId)) <= 1) {
      throw new ConflictException("Cannot remove the last active owner. Transfer ownership first.");
    }

    await this.memberRepository.remove(member);
    return { id: member.id.toString(), removed: true };
  }
}
