import { z } from "zod";

export const CategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  level: z.coerce.number().int().min(1).max(3).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  rootOnly: z.preprocess(
    (val) => (val === undefined ? undefined : val === "true" || val === true),
    z.boolean().optional(),
  ),
  isActive: z.preprocess(
    (val) => (val === undefined ? undefined : val === "true" || val === true),
    z.boolean().optional(),
  ),
  includeChildren: z.preprocess(
    (val) => (val === undefined ? undefined : val === "true" || val === true),
    z.boolean().optional(),
  ),
  includeParent: z.preprocess(
    (val) => (val === undefined ? undefined : val === "true" || val === true),
    z.boolean().optional(),
  ),
  sortBy: z.enum(["sortOrder", "name", "level", "createdAt", "id"]).default("sortOrder"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("ASC"),
});

export type CategoryQueryDto = z.infer<typeof CategoryQuerySchema>;
