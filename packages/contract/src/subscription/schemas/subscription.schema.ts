import { z } from "zod";
import {
  BillingInterval,
  OverrideTargetType,
  SubscriptionItemType,
  SubscriptionStatus,
} from "../enums/subscription.enums.js";
import { SubscriptionAddonSchema, SubscriptionPlanSchema, SubscriptionPriceSchema } from "./plan.schema.js";

export const OrganizationSubscriptionItemSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  itemType: z.nativeEnum(SubscriptionItemType),
  planId: z.string().nullable().optional(),
  addonId: z.string().nullable().optional(),
  plan: SubscriptionPlanSchema.optional(),
  addon: SubscriptionAddonSchema.optional(),
  quantity: z.number().int(),
  unitPriceMinorUnits: z.string(),
  currency: z.string().length(3),
  isActive: z.boolean(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable().optional(),
});
export type OrganizationSubscriptionItem = z.infer<typeof OrganizationSubscriptionItemSchema>;

export const OrganizationEntitlementOverrideSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  overrideTarget: z.nativeEnum(OverrideTargetType),
  featureId: z.string().nullable().optional(),
  limitDefId: z.string().nullable().optional(),
  isUnlimited: z.boolean(),
  overrideLimitValue: z.string().nullable().optional(),
  overrideBooleanValue: z.boolean().nullable().optional(),
  reason: z.string(),
  authorizedBy: z.string(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});
export type OrganizationEntitlementOverride = z.infer<typeof OrganizationEntitlementOverrideSchema>;

export const OrganizationSubscriptionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  planId: z.string(),
  priceId: z.string().nullable().optional(),
  plan: SubscriptionPlanSchema.optional(),
  price: SubscriptionPriceSchema.optional(),
  items: z.array(OrganizationSubscriptionItemSchema).optional(),
  status: z.nativeEnum(SubscriptionStatus),
  billingInterval: z.nativeEnum(BillingInterval),
  currency: z.string().length(3),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime().nullable().optional(),
  trialStart: z.string().datetime().nullable().optional(),
  trialEnd: z.string().datetime().nullable().optional(),
  gracePeriodEnd: z.string().datetime().nullable().optional(),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.string().datetime().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  pendingPlanId: z.string().nullable().optional(),
  pendingPriceId: z.string().nullable().optional(),
  pendingPlan: SubscriptionPlanSchema.optional(),
  pendingChangeEffectiveAt: z.string().datetime().nullable().optional(),
  autoRenew: z.boolean(),
  entitlementsVersion: z.number().int(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type OrganizationSubscription = z.infer<typeof OrganizationSubscriptionSchema>;

export const UpgradeSubscriptionRequestSchema = z.object({
  targetPlanId: z.string().regex(/^\d+$/, "Target plan ID must be a numeric string"),
  targetPriceId: z.string().regex(/^\d+$/, "Target price ID must be a numeric string"),
  preserveCycle: z.boolean().default(true),
});
export type UpgradeSubscriptionRequest = z.infer<typeof UpgradeSubscriptionRequestSchema>;

export const ScheduleDowngradeRequestSchema = z.object({
  targetPlanId: z.string().regex(/^\d+$/, "Target plan ID must be a numeric string"),
  targetPriceId: z.string().regex(/^\d+$/, "Target price ID must be a numeric string").optional().nullable(),
});
export type ScheduleDowngradeRequest = z.infer<typeof ScheduleDowngradeRequestSchema>;

export const CancelSubscriptionRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelSubscriptionRequest = z.infer<typeof CancelSubscriptionRequestSchema>;

export const PurchaseAddonRequestSchema = z.object({
  addonId: z.string().regex(/^\d+$/, "Add-on ID must be a numeric string"),
  quantity: z.number().int().min(1).max(100).default(1),
});
export type PurchaseAddonRequest = z.infer<typeof PurchaseAddonRequestSchema>;

export const CreateEntitlementOverrideRequestSchema = z.object({
  overrideTarget: z.nativeEnum(OverrideTargetType),
  featureId: z.string().regex(/^\d+$/).optional().nullable(),
  limitDefId: z.string().regex(/^\d+$/).optional().nullable(),
  isUnlimited: z.boolean().default(false),
  overrideLimitValue: z.coerce.string().regex(/^\d+$/).optional().nullable(),
  overrideBooleanValue: z.boolean().optional().nullable(),
  reason: z.string().min(5).max(500),
  validUntil: z.string().datetime().optional().nullable(),
});
export type CreateEntitlementOverrideRequest = z.infer<typeof CreateEntitlementOverrideRequestSchema>;
