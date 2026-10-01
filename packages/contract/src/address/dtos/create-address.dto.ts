import { z } from "zod";

export const CreateAddressSchema = z.object({
  countryId: z.coerce.bigint("Invalid country ID"),
  divisionId: z.coerce.bigint("Invalid division ID"),
  divisionId2: z.coerce.bigint("Invalid division ID"),
  cityId: z.coerce.bigint("Invalid city ID").nullable().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  postalCode: z.string("Postal code is required"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .nullable()
    .optional(),
  formattedAddress: z.string().nullable().optional(),
  venueName: z.string().nullable().optional(),
  isDefault: z.boolean().nullable().optional(),
  label: z.string().nullable().optional(),
});

export const CreateAddressDtoSchema = CreateAddressSchema;

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type CreateAddressRequest = CreateAddressDto;
export type CreateAddressInput = z.input<typeof CreateAddressSchema>;
