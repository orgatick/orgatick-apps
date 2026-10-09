import { z } from "zod";

export const UpdateOrganizationPricingControlSchema = z.object({
  paidEventsEnabled: z.boolean(),
  requireBankDetails: z.boolean(),
  disabledReason: z.string().trim().max(500).nullish(),
});

export type UpdateOrganizationPricingControlDto = z.infer<typeof UpdateOrganizationPricingControlSchema>;
