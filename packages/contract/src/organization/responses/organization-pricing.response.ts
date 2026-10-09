import { z } from "zod";
import { createApiResponseSchema } from "../../common/index.js";

export const OrganizationPricingSettingResponseSchema = z.object({
  organizationId: z.string(),
  paidEventsEnabled: z.boolean(),
  requireBankDetails: z.boolean(),
  disabledReason: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
});

export type OrganizationPricingSettingResponse = z.infer<typeof OrganizationPricingSettingResponseSchema>;

export const OrganizationPricingEligibilityResponseSchema = z.object({
  organizationId: z.string(),
  paidEventsEnabled: z.boolean(),
  requireBankDetails: z.boolean(),
  bankDetailsVerified: z.boolean(),
  eligibleForPaidEvents: z.boolean(),
  reasons: z.array(z.string()),
});

export type OrganizationPricingEligibilityResponse = z.infer<typeof OrganizationPricingEligibilityResponseSchema>;

export const OrganizationPricingSettingApiResponseSchema = createApiResponseSchema(
  OrganizationPricingSettingResponseSchema,
);
export type OrganizationPricingSettingApiResponse = z.infer<typeof OrganizationPricingSettingApiResponseSchema>;

export const OrganizationPricingEligibilityApiResponseSchema = createApiResponseSchema(
  OrganizationPricingEligibilityResponseSchema,
);
export type OrganizationPricingEligibilityApiResponse = z.infer<typeof OrganizationPricingEligibilityApiResponseSchema>;
