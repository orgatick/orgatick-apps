import { z } from "zod";

export const QueryAdministrativeDivisionSchema = z.object({
  countryId: z.coerce.bigint("Invalid country ID").optional(),
  parentId: z.coerce.bigint("Invalid parent ID").nullable().optional(),
  level: z.coerce.number().int("Level must be an integer").min(1, "Level must be at least 1").optional(),
  search: z.string().optional(),
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").optional(),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

export const QueryAdministrativeDivisionDtoSchema = QueryAdministrativeDivisionSchema;

export type QueryAdministrativeDivisionDto = z.infer<typeof QueryAdministrativeDivisionSchema>;
export type QueryAdministrativeDivisionQuery = QueryAdministrativeDivisionDto;
export type QueryAdministrativeDivisionInput = z.input<typeof QueryAdministrativeDivisionSchema>;
