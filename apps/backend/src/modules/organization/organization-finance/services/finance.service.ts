import { Injectable } from "@nestjs/common";
import type { OrganizationCommissionSetting } from "../entities/organization-commission-setting.entity";
import { OrganizationFinanceRepository } from "../repositories/finance.repository";

@Injectable()
export class OrganizationFinanceService {
  constructor(private readonly financeRepository: OrganizationFinanceRepository) {}

  async initialize(organizationId: bigint): Promise<OrganizationCommissionSetting> {
    return this.financeRepository.createCommissionSetting(organizationId);
  }
}
