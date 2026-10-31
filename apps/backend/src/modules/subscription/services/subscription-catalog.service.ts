import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { CreatePlanInput } from "@orgatick/contracts";
import {
  SubscriptionAddon,
  SubscriptionFeature,
  SubscriptionLimitDefinition,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  SubscriptionPlanLimit,
  SubscriptionPrice,
} from "../entities";

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
    @InjectRepository(SubscriptionPrice)
    private readonly priceRepo: Repository<SubscriptionPrice>,
    @InjectRepository(SubscriptionPlanFeature)
    private readonly planFeatureRepo: Repository<SubscriptionPlanFeature>,
    @InjectRepository(SubscriptionPlanLimit)
    private readonly planLimitRepo: Repository<SubscriptionPlanLimit>,
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

  async getPublicCatalog(): Promise<SubscriptionPlan[]> {
    return this.listPlans(true);
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

  async createPlan(input: CreatePlanInput): Promise<SubscriptionPlan> {
    const plan = this.planRepo.create({
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      tierLevel: input.tierLevel,
      isActive: true,
      isPublic: input.isPublic ?? true,
      trialPeriodDays: input.trialPeriodDays ?? 0,
      sortOrder: input.sortOrder ?? 0,
    });
    const savedPlan = await this.planRepo.save(plan);

    if (input.prices && input.prices.length > 0) {
      for (const p of input.prices) {
        await this.priceRepo.save(
          this.priceRepo.create({
            planId: savedPlan.id,
            currency: p.currency,
            billingInterval: p.billingInterval,
            priceInMinorUnits: BigInt(p.priceInMinorUnits),
            isActive: true,
          }),
        );
      }
    }

    if (input.features && input.features.length > 0) {
      for (const f of input.features) {
        await this.planFeatureRepo.save(
          this.planFeatureRepo.create({
            planId: savedPlan.id,
            featureId: BigInt(f.featureId),
            isIncluded: f.isIncluded,
            featureLevel: f.featureLevel ?? null,
          }),
        );
      }
    }

    if (input.limits && input.limits.length > 0) {
      for (const l of input.limits) {
        await this.planLimitRepo.save(
          this.planLimitRepo.create({
            planId: savedPlan.id,
            limitDefId: BigInt(l.limitDefId),
            isUnlimited: l.isUnlimited,
            limitValue: l.limitValue ? BigInt(l.limitValue) : null,
          }),
        );
      }
    }

    return this.getPlanById(savedPlan.id);
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
