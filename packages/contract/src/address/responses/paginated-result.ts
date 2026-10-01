import { z } from "zod";

export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int("Total must be an integer").nonnegative("Total cannot be negative"),
    page: z.number().int("Page must be an integer").positive("Page must be positive"),
    limit: z.number().int("Limit must be an integer").positive("Limit must be positive"),
    totalPages: z.number().int("Total pages must be an integer").nonnegative("Total pages cannot be negative"),
  });

export const PaginatedResultSchema = createPaginatedResultSchema(z.unknown());

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
