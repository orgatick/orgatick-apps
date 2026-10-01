import { z } from "zod";

export const AddressFindOptionsSchema = z.object({
  skip: z.coerce.number().int("Skip must be an integer").nonnegative("Skip must be non-negative"),
  take: z.coerce.number().int("Take must be an integer").positive("Take must be positive"),
  countryId: z.coerce.number().int("Country ID must be an integer").positive("Country ID must be positive").optional(),
  divisionId: z.coerce
    .number()
    .int("Division ID must be an integer")
    .positive("Division ID must be positive")
    .optional(),
  cityId: z.coerce.number().int("City ID must be an integer").positive("City ID must be positive").optional(),
  postalCode: z.string().optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AddressFindOptions = z.infer<typeof AddressFindOptionsSchema>;
export type AddressFindOptionsInput = z.input<typeof AddressFindOptionsSchema>;
