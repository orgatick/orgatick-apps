import { z } from "zod";

export const QueryCountrySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").optional(),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  search: z.string().optional(),
  continentCode: z.string().optional(),
  isActive: z.union([z.boolean(), z.enum(["true", "false"]).transform((val) => val === "true")]).optional(),
});

export const QueryCountryDtoSchema = QueryCountrySchema;

export type QueryCountryDto = z.infer<typeof QueryCountrySchema>;
export type QueryCountryQuery = QueryCountryDto;
export type QueryCountryInput = z.input<typeof QueryCountrySchema>;
