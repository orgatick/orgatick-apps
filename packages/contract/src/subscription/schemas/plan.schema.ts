import { z } from "zod";
import { AddonType, BillingInterval, LimitScopeType, MetricType, MetricUnit } from "../enums/subscription.enums.js";

export const SubscriptionLimitDefinitionSchema = z.object({
  id: z.string(),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  limitScope: z.nativeEnum(LimitScopeType),
  metricType: z.nativeEnum(MetricType),
  unit: z.nativeEnum(MetricUnit),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type SubscriptionLimitDefinition = z.infer<typeof SubscriptionLimitDefinitionSchema>;

export const SubscriptionFeatureSchema = z.object({
  id: z.string(),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  category: z.string().min(1).max(50),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type SubscriptionFeature = z.infer<typeof SubscriptionFeatureSchema>;

export const SubscriptionPlanFeatureSchema = z.object({
  id: z.string(),
  planId: z.string(),
  featureId: z.string(),
  feature: SubscriptionFeatureSchema.optional(),
  isIncluded: z.boolean(),
  featureLevel: z.string().nullable().optional(),
});
export type SubscriptionPlanFeature = z.infer<typeof SubscriptionPlanFeatureSchema>;

export const SubscriptionPlanLimitSchema = z.object({
  id: z.string(),
  planId: z.string(),
  limitDefId: z.string(),
  limitDefinition: SubscriptionLimitDefinitionSchema.optional(),
  isUnlimited: z.boolean(),
  limitValue: z.string().nullable().optional(),
});
export type SubscriptionPlanLimit = z.infer<typeof SubscriptionPlanLimitSchema>;

export const SubscriptionPriceSchema = z.object({
  id: z.string(),
  planId: z.string(),
  currency: z.string().length(3),
  billingInterval: z.nativeEnum(BillingInterval),
  priceInMinorUnits: z.string(),
  isActive: z.boolean(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().nullable().optional(),
});
export type SubscriptionPrice = z.infer<typeof SubscriptionPriceSchema>;

export const SubscriptionAddonSchema = z.object({
  id: z.string(),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  addonType: z.nativeEnum(AddonType),
  targetLimitDefId: z.string().nullable().optional(),
  targetFeatureId: z.string().nullable().optional(),
  isUnlimited: z.boolean(),
  increaseValue: z.string().nullable().optional(),
  currency: z.string().length(3),
  billingInterval: z.nativeEnum(BillingInterval),
  priceInMinorUnits: z.string(),
  isActive: z.boolean(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().nullable().optional(),
});
export type SubscriptionAddon = z.infer<typeof SubscriptionAddonSchema>;

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  tierLevel: z.number().int(),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  trialPeriodDays: z.number().int(),
  sortOrder: z.number().int(),
  prices: z.array(SubscriptionPriceSchema).optional(),
  features: z.array(SubscriptionPlanFeatureSchema).optional(),
  limits: z.array(SubscriptionPlanLimitSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export const CreatePlanPriceInputSchema = z.object({
  currency: z.string().length(3).default("INR"),
  billingInterval: z.nativeEnum(BillingInterval),
  priceInMinorUnits: z.coerce.string().regex(/^\d+$/, "Price must be non-negative integer string"),
});

export const CreatePlanFeatureInputSchema = z.object({
  featureId: z.string().regex(/^\d+$/),
  isIncluded: z.boolean().default(true),
  featureLevel: z.string().max(50).optional().nullable(),
});

export const CreatePlanLimitInputSchema = z.object({
  limitDefId: z.string().regex(/^\d+$/),
  isUnlimited: z.boolean().default(false),
  limitValue: z.coerce.string().regex(/^\d+$/).optional().nullable(),
});

export const CreatePlanSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase alphanumeric with underscores"),
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(1000).optional().nullable(),
  tierLevel: z.number().int().min(0).max(1000),
  isPublic: z.boolean().default(true),
  trialPeriodDays: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
  prices: z.array(CreatePlanPriceInputSchema).optional(),
  features: z.array(CreatePlanFeatureInputSchema).optional(),
  limits: z.array(CreatePlanLimitInputSchema).optional(),
});
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export const UpdatePlanSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(1000).optional().nullable(),
  tierLevel: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  trialPeriodDays: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
