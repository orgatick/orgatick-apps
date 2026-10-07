import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { OrganizationAdminState } from "../entities/organization-admin-state.entity";

@Injectable()
export class AdminStateRepository extends Repository<OrganizationAdminState> {
  constructor(dataSource: DataSource) {
    super(OrganizationAdminState, dataSource.createEntityManager());
  }

  /** Returns the admin state row for an organization, or an unsaved placeholder when missing. */
  async ensure(organizationId: bigint): Promise<OrganizationAdminState> {
    const existing = await this.findOneBy({ organizationId });
    if (existing) return existing;
    return this.create({
      organizationId,
      blocked: false,
      hidden: false,
      archived: false,
      restrictedCapabilities: [],
    } satisfies DeepPartial<OrganizationAdminState>);
  }
}
