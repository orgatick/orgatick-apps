import { z } from "zod";

export const CountryFindOptionsSchema = z.object({
  skip: z.coerce.number().int("Skip must be an integer").nonnegative("Skip must be non-negative"),
  take: z.coerce.number().int("Take must be an integer").positive("Take must be positive"),
  search: z.string().optional(),
  continentCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CountryFindOptions = z.infer<typeof CountryFindOptionsSchema>;
export type CountryFindOptionsInput = z.input<typeof CountryFindOptionsSchema>;
