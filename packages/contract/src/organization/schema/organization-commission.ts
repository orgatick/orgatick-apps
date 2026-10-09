import { z } from "zod";

export const UpdateOrganizationCommissionSchema = z.object({
  commissionPercentage: z
    .number()
    .min(0, "Commission percentage cannot be negative")
    .max(100, "Commission percentage cannot exceed 100%"),
});

export type UpdateOrganizationCommissionDto = z.infer<typeof UpdateOrganizationCommissionSchema>;
