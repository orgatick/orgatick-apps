import { z } from "zod";

export const QueryCitySchema = z.object({
  countryId: z.coerce.bigint("Invalid country ID").optional(),
  admin1Id: z.coerce.bigint("Invalid admin1 ID").optional(),
  admin2Id: z.coerce.bigint("Invalid admin2 ID").optional(),
  search: z.string().optional(),
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").optional(),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

export const QueryCityDtoSchema = QueryCitySchema;

export type QueryCityDto = z.infer<typeof QueryCitySchema>;
export type QueryCityQuery = QueryCityDto;
export type QueryCityInput = z.input<typeof QueryCitySchema>;
