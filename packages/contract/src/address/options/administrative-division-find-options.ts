import { z } from "zod";

export const AdministrativeDivisionFindOptionsSchema = z.object({
  skip: z.coerce.number().int("Skip must be an integer").nonnegative("Skip must be non-negative"),
  take: z.coerce.number().int("Take must be an integer").positive("Take must be positive"),
  countryId: z.coerce.bigint("Country ID must be an integer").positive("Country ID must be positive").optional(),
  parentId: z.coerce.bigint("Parent ID must be an integer").positive("Parent ID must be positive").optional(),
  level: z.coerce.number().int("Level must be an integer").positive("Level must be positive").optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AdministrativeDivisionFindOptions = z.infer<typeof AdministrativeDivisionFindOptionsSchema>;
export type AdministrativeDivisionFindOptionsInput = z.input<typeof AdministrativeDivisionFindOptionsSchema>;
