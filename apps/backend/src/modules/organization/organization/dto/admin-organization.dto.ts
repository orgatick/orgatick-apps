import { z } from "zod";
import { OrganizationStatus } from "../enums/organization-status.enum";

export const AdminOrganizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  status: z.nativeEnum(OrganizationStatus).optional(),
  sortBy: z.enum(["created_at", "name", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});
export type AdminOrganizationQueryDto = z.infer<typeof AdminOrganizationQuerySchema>;

export const UpdateOrganizationStatusSchema = z.object({
  status: z.nativeEnum(OrganizationStatus),
});
export type UpdateOrganizationStatusDto = z.infer<typeof UpdateOrganizationStatusSchema>;
