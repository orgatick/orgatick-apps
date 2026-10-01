import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";
import { OrganizationMemberRepository } from "../../organization-member";
import { OrganizationMemberStatus } from "@orgatick/contracts";
import { DEFAULT_ROLE_KEYS } from "@/common/authorization";

@Injectable()
export class AdminOwnershipService {
  constructor(
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly trackingRepository: AdminTrackingRepository,
  ) {}

  async transfer(organizationId: bigint, toUserId: bigint, reason: string | undefined, actor: AdminActor | null) {
    const target = await this.memberRepository.findOne({
      where: { organizationId, userId: toUserId, status: OrganizationMemberStatus.ACTIVE },
      relations: { user: true, role: true },
    });
    if (!target) throw new NotFoundException("Target user is not an active member of this organization");

    const ownerRoleId = await this.memberRepository.findOwnerRoleId(organizationId);
    const adminRoleId = await this.memberRepository.findRoleIdByKey(organizationId, DEFAULT_ROLE_KEYS.ADMIN);
    if (ownerRoleId === null || adminRoleId === null) {
      throw new NotFoundException("Role configuration missing. Ensure default roles are seeded.");
    }

    const currentOwners = await this.memberRepository.find({
      where: { organizationId, roleId: ownerRoleId, status: OrganizationMemberStatus.ACTIVE },
      relations: { user: true },
    });

    const nowOwners = currentOwners.filter((member) => Number(member.userId) !== Number(toUserId));
    for (const owner of nowOwners) {
      owner.roleId = adminRoleId;
      await this.memberRepository.save(owner);
      await this.trackingRepository.recordOwnership({
        organizationId,
        fromUserId: owner.userId,
        fromUserName: owner.user?.name ?? null,
        toUserId,
        toUserName: target.user?.name ?? null,
        action: "transferred",
        reason: reason ?? null,
        actorId: actor?.id ?? null,
        actorName: actor?.name ?? null,
      });
    }

    if (Number(target.roleId) !== Number(ownerRoleId)) {
      target.roleId = ownerRoleId;
      await this.memberRepository.save(target);
    }

    return this.memberRepository.find({
      where: { organizationId },
      relations: { user: true, role: true },
      order: { joinedAt: "ASC" },
    });
  }

  async history(organizationId: bigint) {
    return this.trackingRepository.getOwnershipHistory(organizationId);
  }
}
