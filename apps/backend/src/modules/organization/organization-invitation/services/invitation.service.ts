import { Injectable, NotFoundException } from "@nestjs/common";
import type { OrganizationInvitation } from "../entities/organization-invitation.entity";
import { OrganizationInvitationRepository } from "../repositories/invitation.repository";

@Injectable()
export class OrganizationInvitationService {
  constructor(private readonly invitationRepository: OrganizationInvitationRepository) {}

  async getPendingInvitations(organizationId: bigint): Promise<OrganizationInvitation[]> {
    return await this.invitationRepository.findPendingByOrg(organizationId);
  }

  async getByTokenHash(tokenHash: string): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findByTokenHash(tokenHash);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    return invitation;
  }
}
