import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { OrganizationInvitation } from "../entities/organization-invitation.entity";
import { OrganizationInvitationStatus } from "../enums/organization-invitation-status.enum";

@Injectable()
export class OrganizationInvitationRepository extends Repository<OrganizationInvitation> {
  constructor(dataSource: DataSource) {
    super(OrganizationInvitation, dataSource.createEntityManager());
  }

  async findPendingByOrg(organizationId: bigint): Promise<OrganizationInvitation[]> {
    return this.find({
      where: { organizationId, status: OrganizationInvitationStatus.PENDING },
      relations: { inviter: true },
      order: { createdAt: "DESC" },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<OrganizationInvitation | null> {
    return this.findOne({
      where: { tokenHash },
      relations: { organization: true, inviter: true },
    });
  }
}
