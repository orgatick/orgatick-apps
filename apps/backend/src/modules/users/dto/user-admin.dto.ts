import { z } from "zod";
import { PlatformRole } from "../enums/platform-role.enums";

export const PaginationBaseSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationBase = z.infer<typeof PaginationBaseSchema>;

export const AdminUserQuerySchema = PaginationBaseSchema.extend({
  search: z.string().trim().max(255).optional(),
  role: z.nativeEnum(PlatformRole).optional(),
  sortBy: z.enum(["created_at", "name", "id", "email"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});
export type AdminUserQueryDto = z.infer<typeof AdminUserQuerySchema>;

export const UpdateUserRoleSchema = z.object({
  role: z.nativeEnum(PlatformRole),
});
export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleSchema>;
