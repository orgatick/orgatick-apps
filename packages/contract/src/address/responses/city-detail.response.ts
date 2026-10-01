import { z } from "zod";

export const CityDetailCountryRefSchema = z.object({
  id: z.bigint("Invalid country ID"),
  code: z.string(),
  name: z.string(),
});

export type CityDetailCountryRef = z.infer<typeof CityDetailCountryRefSchema>;

export const CityDetailAdminRefSchema = z.object({
  id: z.bigint("Invalid admin ID"),
  code: z.string(),
  name: z.string(),
});

export type CityDetailAdminRef = z.infer<typeof CityDetailAdminRefSchema>;

export const CityDetailResponseSchema = z.object({
  id: z.bigint("Invalid city ID"),
  name: z.string(),
  nameAscii: z.string(),
  slug: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number().nullable().optional(),
  timezone: z.string().nullable().optional(),
  isActive: z.boolean(),
  country: CityDetailCountryRefSchema,
  admin1: CityDetailAdminRefSchema.nullable().optional(),
  admin2: CityDetailAdminRefSchema.nullable().optional(),
});

export type CityDetailResponse = z.infer<typeof CityDetailResponseSchema>;
