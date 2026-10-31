import { z } from "zod";
import { LimitScopeType, MetricType, MetricUnit } from "../enums/subscription.enums.js";
import { SubscriptionLimitDefinitionSchema } from "./plan.schema.js";

export const SubscriptionUsageCounterSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  limitDefId: z.string(),
  limitDefinition: SubscriptionLimitDefinitionSchema.optional(),
  currentValue: z.string(),
  lastRecalculatedAt: z.string().datetime(),
});
export type SubscriptionUsageCounter = z.infer<typeof SubscriptionUsageCounterSchema>;

export const SubscriptionUsagePeriodSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  limitDefId: z.string(),
  limitDefinition: SubscriptionLimitDefinitionSchema.optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  usageCount: z.string(),
  limitSnapshot: z.string().nullable().optional(),
  isUnlimited: z.boolean(),
});
export type SubscriptionUsagePeriod = z.infer<typeof SubscriptionUsagePeriodSchema>;

export const EffectiveLimitSchema = z.object({
  code: z.string(),
  name: z.string(),
  limitScope: z.nativeEnum(LimitScopeType),
  metricType: z.nativeEnum(MetricType),
  unit: z.nativeEnum(MetricUnit),
  isUnlimited: z.boolean(),
  limitValue: z.string().nullable(),
  currentUsage: z.string(),
  percentageUsed: z.number().min(0).max(100).nullable(),
});
export type EffectiveLimit = z.infer<typeof EffectiveLimitSchema>;

export const EffectiveFeatureSchema = z.object({
  code: z.string(),
  name: z.string(),
  category: z.string(),
  isIncluded: z.boolean(),
  featureLevel: z.string().nullable().optional(),
});
export type EffectiveFeature = z.infer<typeof EffectiveFeatureSchema>;

export const OrganizationEffectiveEntitlementsSchema = z.object({
  organizationId: z.string(),
  planCode: z.string(),
  planName: z.string(),
  tierLevel: z.number().int(),
  status: z.string(),
  entitlementsVersion: z.number().int(),
  features: z.record(z.string(), EffectiveFeatureSchema),
  limits: z.record(z.string(), EffectiveLimitSchema),
});
export type OrganizationEffectiveEntitlements = z.infer<typeof OrganizationEffectiveEntitlementsSchema>;
