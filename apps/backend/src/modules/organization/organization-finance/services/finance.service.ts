import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { OrganizationCommissionResponse } from "@orgatick/contracts";
import Organization from "../../organization/entities/organization.entity";
import type { OrganizationCommissionSetting } from "../entities/organization-commission-setting.entity";
import { OrganizationFinanceRepository } from "../repositories/finance.repository";

export function mapCommissionToResponse(entity: OrganizationCommissionSetting): OrganizationCommissionResponse {
  return {
    organizationId: String(entity.organizationId),
    commissionPercentage: Number(entity.commissionPercentage),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

@Injectable()
export class OrganizationFinanceService {
  constructor(
    private readonly financeRepository: OrganizationFinanceRepository,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async initialize(organizationId: bigint): Promise<OrganizationCommissionSetting> {
    return this.financeRepository.ensure(organizationId);
  }

  async getCommission(organizationId: bigint): Promise<OrganizationCommissionResponse> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const setting = await this.financeRepository.ensure(organizationId);
    return mapCommissionToResponse(setting);
  }

  async updateCommission(organizationId: bigint, percentage: number): Promise<OrganizationCommissionResponse> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const setting = await this.financeRepository.updateCommission(organizationId, percentage);
    return mapCommissionToResponse(setting);
  }
}
