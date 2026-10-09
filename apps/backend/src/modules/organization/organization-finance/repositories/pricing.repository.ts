import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { OrganizationPricingSetting } from "../entities/organization-pricing-setting.entity";

@Injectable()
export class OrganizationPricingRepository extends Repository<OrganizationPricingSetting> {
  constructor(dataSource: DataSource) {
    super(OrganizationPricingSetting, dataSource.createEntityManager());
  }

  async findByOrganizationId(organizationId: bigint): Promise<OrganizationPricingSetting | null> {
    return this.findOne({ where: { organizationId } });
  }

  async ensure(
    organizationId: bigint,
    defaults: { paidEventsEnabled?: boolean; requireBankDetails?: boolean } = {},
  ): Promise<OrganizationPricingSetting> {
    const existing = await this.findByOrganizationId(organizationId);
    if (existing) return existing;

    const created = this.create({
      organizationId,
      paidEventsEnabled: defaults.paidEventsEnabled ?? false,
      requireBankDetails: defaults.requireBankDetails ?? true,
      disabledReason: null,
      updatedBy: null,
    } satisfies DeepPartial<OrganizationPricingSetting>);

    return this.save(created);
  }
}
