import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import {
  AddonType,
  BillingInterval,
  OverrideTargetType,
  SubscriptionStatus,
  type EffectiveFeature,
  type EffectiveLimit,
  type OrganizationEffectiveEntitlements,
} from "@orgatick/contracts";
import { OrganizationEntitlementOverride, OrganizationSubscription } from "../entities";
import { EntitlementCacheService } from "./entitlement-cache.service";
import { SubscriptionCatalogService } from "./subscription-catalog.service";
import { SubscriptionUsageService } from "./subscription-usage.service";

@Injectable()
export class EntitlementService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: EntitlementCacheService,
    private readonly catalogService: SubscriptionCatalogService,
    private readonly usageService: SubscriptionUsageService,
    @InjectRepository(OrganizationSubscription)
    private readonly subRepo: Repository<OrganizationSubscription>,
    @InjectRepository(OrganizationEntitlementOverride)
    private readonly overrideRepo: Repository<OrganizationEntitlementOverride>,
  ) {}

  async getEffectiveEntitlements(organizationId: bigint): Promise<OrganizationEffectiveEntitlements> {
    const cached = await this.cacheService.get(organizationId);
    if (cached) return cached;

    // 1. Fetch active primary subscription
    let subscription = await this.subRepo.findOne({
      where: {
        organizationId,
        status: In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIALING,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.GRACE_PERIOD,
        ]),
      },
      relations: {
        plan: {
          features: { feature: true },
          limits: { limitDefinition: true },
        },
        items: {
          addon: {
            targetFeature: true,
            targetLimitDefinition: true,
          },
        },
      },
    });

    // Fallback: If no subscription exists, resolve default FREE plan
    if (!subscription) {
      const freePlan = await this.catalogService.getPlanByCode("free");
      subscription = this.subRepo.create({
        organizationId,
        planId: freePlan.id,
        plan: freePlan,
        status: SubscriptionStatus.ACTIVE,
        billingInterval: BillingInterval.NONE,
        currency: "INR",
        currentPeriodStart: new Date(),
        entitlementsVersion: 1,
      });
    }

    const effectiveFeatures: Record<string, EffectiveFeature> = {};
    const effectiveLimits: Record<string, EffectiveLimit> = {};

    // Baseline: Plan features
    if (subscription.plan?.features) {
      for (const pf of subscription.plan.features) {
        effectiveFeatures[pf.feature.code] = {
          code: pf.feature.code,
          name: pf.feature.name,
          category: pf.feature.category,
          isIncluded: pf.isIncluded,
        };
      }
    }

    // Baseline: Plan limits
    if (subscription.plan?.limits) {
      for (const pl of subscription.plan.limits) {
        effectiveLimits[pl.limitDefinition.code] = {
          code: pl.limitDefinition.code,
          name: pl.limitDefinition.name,
          limitScope: pl.limitDefinition.limitScope,
          metricType: pl.limitDefinition.metricType,
          unit: pl.limitDefinition.unit,
          isUnlimited: pl.isUnlimited,
          limitValue: pl.limitValue ? pl.limitValue.toString() : null,
          currentUsage: "0",
          percentageUsed: null,
        };
      }
    }

    // Layer 2: Add-ons (stacked on active subscription items)
    if (subscription.items) {
      for (const item of subscription.items) {
        const addon = item.addon;
        if (!addon) continue;

        if (addon.addonType === AddonType.FEATURE_UNLOCK && addon.targetFeature) {
          effectiveFeatures[addon.targetFeature.code] = {
            code: addon.targetFeature.code,
            name: addon.targetFeature.name,
            category: addon.targetFeature.category,
            isIncluded: true,
          };
        } else if (
          addon.addonType === AddonType.LIMIT_INCREASE &&
          addon.targetLimitDefinition &&
          addon.increaseValue != null
        ) {
          const limitCode = addon.targetLimitDefinition.code;
          const currentLimit = effectiveLimits[limitCode];
          if (currentLimit && !currentLimit.isUnlimited) {
            const addedValue = BigInt(addon.increaseValue) * BigInt(item.quantity);
            const baseValue = currentLimit.limitValue ? BigInt(currentLimit.limitValue) : 0n;
            currentLimit.limitValue = (baseValue + addedValue).toString();
          }
        }
      }
    }

    // Layer 3: Administrative Overrides (highest precedence)
    const now = new Date();
    const overrides = await this.overrideRepo.find({
      where: { organizationId },
      relations: { feature: true, limitDefinition: true },
    });

    for (const ov of overrides) {
      if (ov.validFrom > now) continue;
      if (ov.validUntil && ov.validUntil <= now) continue;

      if (ov.overrideTarget === OverrideTargetType.FEATURE && ov.feature) {
        effectiveFeatures[ov.feature.code] = {
          code: ov.feature.code,
          name: ov.feature.name,
          category: ov.feature.category,
          isIncluded: ov.overrideBooleanValue ?? true,
        };
      } else if (ov.overrideTarget === OverrideTargetType.LIMIT && ov.limitDefinition) {
        const limitCode = ov.limitDefinition.code;
        const currentLimit = effectiveLimits[limitCode];
        if (currentLimit) {
          currentLimit.isUnlimited = ov.isUnlimited;
          currentLimit.limitValue =
            ov.overrideLimitValue != null ? ov.overrideLimitValue.toString() : currentLimit.limitValue;
        }
      }
    }

    // Attach real-time usage metrics and calculate percentage used
    const counters = await this.usageService.getCounters(organizationId);
    for (const counter of counters) {
      const code = counter.limitDefinition?.code;
      if (code && effectiveLimits[code]) {
        effectiveLimits[code].currentUsage = counter.currentValue.toString();
        if (!effectiveLimits[code].isUnlimited && effectiveLimits[code].limitValue) {
          const maxVal = Number(effectiveLimits[code].limitValue);
          const used = Number(counter.currentValue);
          if (maxVal > 0) {
            effectiveLimits[code].percentageUsed = Math.min(100, Math.round((used / maxVal) * 100));
          }
        }
      }
    }

    const result: OrganizationEffectiveEntitlements = {
      organizationId: organizationId.toString(),
      planCode: subscription.plan.code,
      planName: subscription.plan.name,
      tierLevel: subscription.plan.tierLevel,
      status: subscription.status,
      entitlementsVersion: subscription.entitlementsVersion,
      features: effectiveFeatures,
      limits: effectiveLimits,
    };

    await this.cacheService.set(organizationId, result);
    return result;
  }

  async assertFeature(organizationId: bigint, featureCode: string): Promise<void> {
    const entitlements = await this.getEffectiveEntitlements(organizationId);
    const feature = entitlements.features[featureCode];
    if (!feature?.isIncluded) {
      throw new ForbiddenException(
        `Your organization plan (${entitlements.planName}) does not include access to '${featureCode}'. Please upgrade your subscription.`,
      );
    }
  }

  async assertLimit(organizationId: bigint, limitCode: string, requested = 1): Promise<void> {
    // Acquire PostgreSQL transaction-scoped advisory lock using hash of org + metric
    const lockKey = this.generateLockHash(organizationId, limitCode);
    await this.dataSource.query("SELECT pg_advisory_xact_lock($1)", [lockKey]);

    const entitlements = await this.getEffectiveEntitlements(organizationId);
    const limit = entitlements.limits[limitCode];

    if (!limit) {
      throw new NotFoundException(`Limit definition '${limitCode}' not found`);
    }

    if (limit.isUnlimited) return;

    const maxAllowed = limit.limitValue ? BigInt(limit.limitValue) : 0n;
    const currentUsage = BigInt(limit.currentUsage);

    if (currentUsage + BigInt(requested) > maxAllowed) {
      throw new ForbiddenException(
        `Organization limit exceeded for '${limit.name}'. Current: ${currentUsage}, Allowed: ${maxAllowed}. Please upgrade your subscription.`,
      );
    }
  }

  private generateLockHash(organizationId: bigint, key: string): number {
    let hash = 0;
    const str = `${organizationId.toString()}:${key}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
