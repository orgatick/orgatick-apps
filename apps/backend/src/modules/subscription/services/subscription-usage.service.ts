import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrganizationMemberStatus } from "../../organization/organization-member/enums/organization-member-status.enum";
import { OrganizationMember } from "../../organization/organization-member/entities/organization-member.entity";
import { Role } from "../../../common/authorization/entities/role.entity";
import { SubscriptionLimitDefinition, SubscriptionUsageCounter } from "../entities";

@Injectable()
export class SubscriptionUsageService {
  constructor(
    @InjectRepository(SubscriptionUsageCounter)
    private readonly counterRepo: Repository<SubscriptionUsageCounter>,
    @InjectRepository(SubscriptionLimitDefinition)
    private readonly limitDefRepo: Repository<SubscriptionLimitDefinition>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepo: Repository<OrganizationMember>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async getCounters(organizationId: bigint): Promise<SubscriptionUsageCounter[]> {
    return this.counterRepo.find({
      where: { organizationId },
      relations: { limitDefinition: true },
    });
  }

  async getCounterValue(organizationId: bigint, limitCode: string): Promise<bigint> {
    const counter = await this.counterRepo.findOne({
      where: {
        organizationId,
        limitDefinition: { code: limitCode },
      },
      relations: { limitDefinition: true },
    });
    return counter ? counter.currentValue : 0n;
  }

  async incrementCounter(organizationId: bigint, limitCode: string, delta = 1n): Promise<bigint> {
    const limitDef = await this.limitDefRepo.findOne({ where: { code: limitCode } });
    if (!limitDef) return 0n;

    let counter = await this.counterRepo.findOne({
      where: { organizationId, limitDefId: limitDef.id },
    });

    if (!counter) {
      counter = this.counterRepo.create({
        organizationId,
        limitDefId: limitDef.id,
        currentValue: delta > 0n ? delta : 0n,
        lastRecalculatedAt: new Date(),
      });
    } else {
      counter.currentValue = BigInt(counter.currentValue) + delta;
      if (counter.currentValue < 0n) counter.currentValue = 0n;
      counter.lastRecalculatedAt = new Date();
    }

    const saved = await this.counterRepo.save(counter);
    return saved.currentValue;
  }

  async decrementCounter(organizationId: bigint, limitCode: string, delta = 1n): Promise<bigint> {
    return this.incrementCounter(organizationId, limitCode, -delta);
  }

  async syncAllCounters(organizationId: bigint): Promise<void> {
    // 1. Team members count
    const memberLimitDef = await this.limitDefRepo.findOne({ where: { code: "max_team_members" } });
    if (memberLimitDef) {
      const activeMembers = await this.memberRepo.count({
        where: { organizationId, status: OrganizationMemberStatus.ACTIVE },
      });
      await this.saveCounterValue(organizationId, memberLimitDef.id, BigInt(activeMembers));
    }

    // 2. Custom roles count
    const rolesLimitDef = await this.limitDefRepo.findOne({ where: { code: "max_custom_roles" } });
    if (rolesLimitDef) {
      const customRoles = await this.roleRepo.count({
        where: { organizationId, isActive: true },
      });
      await this.saveCounterValue(organizationId, rolesLimitDef.id, BigInt(customRoles));
    }
  }

  private async saveCounterValue(organizationId: bigint, limitDefId: bigint, value: bigint): Promise<void> {
    let counter = await this.counterRepo.findOne({
      where: { organizationId, limitDefId },
    });
    if (!counter) {
      counter = this.counterRepo.create({
        organizationId,
        limitDefId,
        currentValue: value,
        lastRecalculatedAt: new Date(),
      });
    } else {
      counter.currentValue = value;
      counter.lastRecalculatedAt = new Date();
    }
    await this.counterRepo.save(counter);
  }
}
