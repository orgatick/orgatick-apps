import { z } from "zod";
import {
  createApiResponseSchema,
  createPaginatedApiResponseSchema,
  createPaginatedDataSchema,
} from "../../../common/index.js";

/**
 * Category item schema
 */
export const CategoryResponseSchema = z.object({
  id: z.bigint(),
  parentId: z.bigint().nullable(),
  name: z.string(),
  slug: z.string(),
  level: z.number().int().positive(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.date("createdAt must be a valid ISO 8601 datetime string"),
  updatedAt: z.date("updatedAt must be a valid ISO 8601 datetime string"),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

/**
 * Paginated Category Data Schema & Type ({ items: CategoryResponse[], meta: PaginationMeta })
 */
export const PaginatedCategoryDataSchema = createPaginatedDataSchema(CategoryResponseSchema);
export type PaginatedCategoryData = z.infer<typeof PaginatedCategoryDataSchema>;

/**
 * Single Category API Response ({ success, statusCode, data: CategoryResponse, timestamp })
 */
export const SingleCategoryResponseSchema = createApiResponseSchema(CategoryResponseSchema);
export type SingleCategoryResponse = z.infer<typeof SingleCategoryResponseSchema>;

/**
 * Paginated Category API Response ({ success, statusCode, data: PaginatedCategoryData, timestamp })
 */
export const PaginatedCategoryResponseSchema = createPaginatedApiResponseSchema(CategoryResponseSchema);
export type PaginatedCategoryResponse = z.infer<typeof PaginatedCategoryResponseSchema>;
