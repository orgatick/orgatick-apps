import { z } from "zod";
import { OrganizationStatus, OrganizationVerificationStatus } from "@orgatick/contracts";

export const AdminOrganizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  status: z.enum(Object.values(OrganizationStatus)).optional(),
  verificationStatus: z.enum(Object.values(OrganizationVerificationStatus)).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  blocked: z.preprocess(
    (value) => (value === undefined ? undefined : value === "true" || value === true),
    z.boolean().optional(),
  ),
  archived: z.preprocess(
    (value) => (value === undefined ? undefined : value === "true" || value === true),
    z.boolean().optional(),
  ),
  sortBy: z.enum(["created_at", "name", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});
export type AdminOrganizationQueryDto = z.infer<typeof AdminOrganizationQuerySchema>;

export const UpdateOrganizationStatusSchema = z.object({
  status: z.enum(Object.values(OrganizationStatus)),
  reason: z.string().trim().max(500).optional(),
});
export type UpdateOrganizationStatusDto = z.infer<typeof UpdateOrganizationStatusSchema>;
