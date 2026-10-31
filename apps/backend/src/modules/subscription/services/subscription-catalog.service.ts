import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubscriptionAddon, SubscriptionFeature, SubscriptionLimitDefinition, SubscriptionPlan } from "../entities";

@Injectable()
export class SubscriptionCatalogService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionFeature)
    private readonly featureRepo: Repository<SubscriptionFeature>,
    @InjectRepository(SubscriptionLimitDefinition)
    private readonly limitDefRepo: Repository<SubscriptionLimitDefinition>,
    @InjectRepository(SubscriptionAddon)
    private readonly addonRepo: Repository<SubscriptionAddon>,
  ) {}

  async listPlans(publicOnly = true): Promise<SubscriptionPlan[]> {
    const whereClause = publicOnly ? { isActive: true, isPublic: true } : { isActive: true };
    return this.planRepo.find({
      where: whereClause,
      order: { sortOrder: "ASC", tierLevel: "ASC" },
      relations: {
        prices: true,
        features: { feature: true },
        limits: { limitDefinition: true },
      },
    });
  }

  async getPlanByCode(code: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({
      where: { code, isActive: true },
      relations: {
        prices: true,
        features: { feature: true },
        limits: { limitDefinition: true },
      },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan '${code}' not found`);
    }
    return plan;
  }

  async getPlanById(id: bigint): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: {
        prices: true,
        features: { feature: true },
        limits: { limitDefinition: true },
      },
    });
    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID '${id.toString()}' not found`);
    }
    return plan;
  }

  async listAddons(): Promise<SubscriptionAddon[]> {
    return this.addonRepo.find({
      where: { isActive: true },
      relations: {
        targetLimitDefinition: true,
        targetFeature: true,
      },
      order: { priceInMinorUnits: "ASC" },
    });
  }

  async listFeatures(): Promise<SubscriptionFeature[]> {
    return this.featureRepo.find({
      where: { isActive: true },
      order: { category: "ASC", name: "ASC" },
    });
  }

  async listLimitDefinitions(): Promise<SubscriptionLimitDefinition[]> {
    return this.limitDefRepo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
  }
}
