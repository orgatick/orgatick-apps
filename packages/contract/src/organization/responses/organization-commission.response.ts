import { z } from "zod";
import { createApiResponseSchema } from "../../common/index.js";

export const OrganizationCommissionResponseSchema = z.object({
  organizationId: z.string(),
  commissionPercentage: z.number(),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
});

export type OrganizationCommissionResponse = z.infer<typeof OrganizationCommissionResponseSchema>;

export const OrganizationCommissionApiResponseSchema = createApiResponseSchema(OrganizationCommissionResponseSchema);
export type OrganizationCommissionApiResponse = z.infer<typeof OrganizationCommissionApiResponseSchema>;
