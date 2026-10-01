import { z } from "zod";

export const CityFindOptionsSchema = z.object({
  skip: z.coerce.number().int("Skip must be an integer").nonnegative("Skip must be non-negative"),
  take: z.coerce.number().int("Take must be an integer").positive("Take must be positive"),
  countryId: z.coerce.bigint("Country ID must be an integer").positive("Country ID must be positive").optional(),
  admin1Id: z.coerce.bigint("Admin1 ID must be an integer").positive("Admin1 ID must be positive").optional(),
  admin2Id: z.coerce.bigint("Admin2 ID must be an integer").positive("Admin2 ID must be positive").optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CityFindOptions = z.infer<typeof CityFindOptionsSchema>;
export type CityFindOptionsInput = z.input<typeof CityFindOptionsSchema>;
