import { z } from "zod";

export const AdministrativeDivisionCountryRefSchema = z.object({
  id: z.bigint("Invalid country ID"),
  code: z.string(),
  name: z.string(),
});

export type AdministrativeDivisionCountryRef = z.infer<typeof AdministrativeDivisionCountryRefSchema>;

export const AdministrativeDivisionParentRefSchema = z.object({
  id: z.bigint("Invalid parent ID"),
  code: z.string(),
  name: z.string(),
  level: z.number().int(),
});

export type AdministrativeDivisionParentRef = z.infer<typeof AdministrativeDivisionParentRefSchema>;

export const AdministrativeDivisionResponseSchema = z.object({
  id: z.bigint("Invalid division ID"),
  code: z.string(),
  name: z.string(),
  nameAscii: z.string(),
  level: z.number().int(),
  isActive: z.boolean(),
  country: AdministrativeDivisionCountryRefSchema,
  parent: AdministrativeDivisionParentRefSchema.nullable().optional(),
});

export type AdministrativeDivisionResponse = z.infer<typeof AdministrativeDivisionResponseSchema>;
