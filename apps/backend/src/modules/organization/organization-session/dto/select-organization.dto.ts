import { z } from "zod";

export const SelectOrganizationSchema = z.object({
  organizationId: z.string().regex(/^\d+$/, "organizationId must be a positive integer string"),
});

export type SelectOrganizationDto = z.infer<typeof SelectOrganizationSchema>;
