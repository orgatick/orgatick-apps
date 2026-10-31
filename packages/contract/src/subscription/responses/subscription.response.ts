import { z } from "zod";
import { createApiResponseSchema, createPaginatedApiResponseSchema } from "../../common/index.js";
import { SubscriptionInvoiceSchema } from "../schemas/invoice.schema.js";
import { SubscriptionAddonSchema, SubscriptionPlanSchema } from "../schemas/plan.schema.js";
import { OrganizationSubscriptionSchema } from "../schemas/subscription.schema.js";
import { OrganizationEffectiveEntitlementsSchema } from "../schemas/usage.schema.js";

export const SubscriptionPlanResponseSchema = createApiResponseSchema(SubscriptionPlanSchema);
export type SubscriptionPlanResponse = z.infer<typeof SubscriptionPlanResponseSchema>;

export const SubscriptionPlanListResponseSchema = createApiResponseSchema(z.array(SubscriptionPlanSchema));
export type SubscriptionPlanListResponse = z.infer<typeof SubscriptionPlanListResponseSchema>;

export const SubscriptionAddonListResponseSchema = createApiResponseSchema(z.array(SubscriptionAddonSchema));
export type SubscriptionAddonListResponse = z.infer<typeof SubscriptionAddonListResponseSchema>;

export const OrganizationSubscriptionResponseSchema = createApiResponseSchema(OrganizationSubscriptionSchema);
export type OrganizationSubscriptionResponse = z.infer<typeof OrganizationSubscriptionResponseSchema>;

export const OrganizationEffectiveEntitlementsResponseSchema = createApiResponseSchema(
  OrganizationEffectiveEntitlementsSchema,
);
export type OrganizationEffectiveEntitlementsResponse = z.infer<typeof OrganizationEffectiveEntitlementsResponseSchema>;

export const SubscriptionInvoiceResponseSchema = createApiResponseSchema(SubscriptionInvoiceSchema);
export type SubscriptionInvoiceResponse = z.infer<typeof SubscriptionInvoiceResponseSchema>;

export const SubscriptionInvoiceListResponseSchema = createPaginatedApiResponseSchema(SubscriptionInvoiceSchema);
export type SubscriptionInvoiceListResponse = z.infer<typeof SubscriptionInvoiceListResponseSchema>;

export const ProrationPreviewSchema = z.object({
  currentPlanName: z.string(),
  targetPlanName: z.string(),
  currency: z.string(),
  daysRemainingInPeriod: z.number().int(),
  totalDaysInPeriod: z.number().int(),
  unusedCurrentCreditMinorUnits: z.string(),
  targetPlanProratedChargeMinorUnits: z.string(),
  netPayableMinorUnits: z.string(),
  periodEnd: z.string().datetime(),
});
export type ProrationPreview = z.infer<typeof ProrationPreviewSchema>;

export const ProrationPreviewResponseSchema = createApiResponseSchema(ProrationPreviewSchema);
export type ProrationPreviewResponse = z.infer<typeof ProrationPreviewResponseSchema>;
