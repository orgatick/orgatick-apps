import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { OrganizationCommissionSetting } from "../entities/organization-commission-setting.entity";

@Injectable()
export class OrganizationFinanceRepository extends Repository<OrganizationCommissionSetting> {
  constructor(dataSource: DataSource) {
    super(OrganizationCommissionSetting, dataSource.createEntityManager());
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
}
