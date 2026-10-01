import { z } from "zod";

export const CountryDetailResponseSchema = z.object({
  id: z.bigint("Invalid country ID"),
  code: z.string(),
  code3: z.string(),
  numericCode: z.string(),
  name: z.string(),
  capital: z.string().nullable().optional(),
  continentCode: z.string().nullable().optional(),
  currencyCode: z.string().nullable().optional(),
  currencyName: z.string().nullable().optional(),
  phoneCode: z.string().nullable().optional(),
  postalCodeFormat: z.string().nullable().optional(),
  postalCodeRegex: z.string().nullable().optional(),
  tld: z.string().nullable().optional(),
  area: z.number().nullable().optional(),
  population: z.number().nullable().optional(),
  isActive: z.boolean(),
});

export type CountryDetailResponse = z.infer<typeof CountryDetailResponseSchema>;
