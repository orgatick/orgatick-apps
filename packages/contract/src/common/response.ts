import { z } from "zod";

/**
 * Standard pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
  total: z.number().int("Total must be an integer").nonnegative("Total cannot be negative"),
  page: z.number().int("Page must be an integer").positive("Page must be positive"),
  limit: z.number().int("Limit must be an integer").positive("Limit must be positive"),
  totalPages: z.number().int("Total pages must be an integer").nonnegative("Total pages cannot be negative"),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Schema builder for paginated data ({ items: T[], meta: PaginationMeta })
 */
export const createPaginatedDataSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Schema builder for standard API response envelope
 * {
 *   success: boolean;
 *   statusCode: number;
 *   data: T;
 *   timestamp: string;
 * }
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().default(true),
    statusCode: z.number().int().default(200),
    data: dataSchema,
    timestamp: z.string().datetime("timestamp must be a valid ISO 8601 datetime string"),
  });

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Schema builder for standard paginated API response envelope
 */
export const createPaginatedApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  createApiResponseSchema(createPaginatedDataSchema(itemSchema));

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;
