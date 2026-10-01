import { z } from "zod";

export const AddressCountryRefSchema = z.object({
  id: z.bigint("Invalid country ID"),
  code: z.string(),
  code3: z.string(),
  name: z.string(),
});

export type AddressCountryRef = z.infer<typeof AddressCountryRefSchema>;

export const AddressDivisionRefSchema = z.object({
  id: z.bigint("Invalid division ID"),
  code: z.string(),
  name: z.string(),
  level: z.number().int(),
});

export type AddressDivisionRef = z.infer<typeof AddressDivisionRefSchema>;

export const AddressCityRefSchema = z.object({
  id: z.bigint("Invalid city ID"),
  name: z.string(),
  slug: z.string().nullable().optional(),
});

export type AddressCityRef = z.infer<typeof AddressCityRefSchema>;

export const AddressResponseSchema = z.object({
  uuid: z.string("Invalid address UUID"),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  formattedAddress: z.string().nullable().optional(),
  isActive: z.boolean(),
  country: AddressCountryRefSchema,
  division: AddressDivisionRefSchema.nullable().optional(),
  city: AddressCityRefSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AddressResponse = z.infer<typeof AddressResponseSchema>;
