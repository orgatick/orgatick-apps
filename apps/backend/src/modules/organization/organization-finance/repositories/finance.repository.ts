import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { OrganizationCommissionSetting } from "../entities/organization-commission-setting.entity";

@Injectable()
export class OrganizationFinanceRepository extends Repository<OrganizationCommissionSetting> {
  constructor(dataSource: DataSource) {
    super(OrganizationCommissionSetting, dataSource.createEntityManager());
  }

  async findByOrganizationId(organizationId: bigint): Promise<OrganizationCommissionSetting | null> {
    return this.findOne({ where: { organizationId } });
  }

  async ensure(organizationId: bigint, defaultPercentage = 7.0): Promise<OrganizationCommissionSetting> {
    const existing = await this.findByOrganizationId(organizationId);
    if (existing) return existing;

    return this.createCommissionSetting(organizationId, defaultPercentage);
  }

  async createCommissionSetting(
    organizationId: bigint,
    commissionPercentage = 7.0,
  ): Promise<OrganizationCommissionSetting> {
    return this.save(
      this.create({
        organizationId,
        commissionPercentage,
      } satisfies DeepPartial<OrganizationCommissionSetting>),
    );
  }

  async updateCommission(organizationId: bigint, percentage: number): Promise<OrganizationCommissionSetting> {
    const setting = await this.ensure(organizationId);
    setting.commissionPercentage = percentage;
    return this.save(setting);
  }
}
