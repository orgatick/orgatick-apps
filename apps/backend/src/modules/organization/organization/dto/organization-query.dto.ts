import { z } from "zod";
import { OrganizationStatus } from "../enums/organization-status.enum";

export const OrganizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  subCategoryId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrganizationStatus).optional(),
  sortBy: z.enum(["created_at", "name", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});

export type OrganizationQueryDto = z.infer<typeof OrganizationQuerySchema>;
