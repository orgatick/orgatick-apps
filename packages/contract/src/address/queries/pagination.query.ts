import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").optional(),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

export const PaginationQueryDtoSchema = PaginationQuerySchema;

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
export type PaginationQuery = PaginationQueryDto;
export type PaginationQueryInput = z.input<typeof PaginationQuerySchema>;
