import { z } from "zod";

export const UpdateAddressSchema = z.object({
  countryId: z.bigint("Invalid country ID").optional(),
  divisionId: z.bigint("Invalid division ID").nullable().optional(),
  cityId: z.bigint("Invalid city ID").nullable().optional(),
  addressLine1: z.string().min(1, "Address line 1 cannot be empty").optional(),
  addressLine2: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
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
  isActive: z.boolean().optional(),
});

export const UpdateAddressDtoSchema = UpdateAddressSchema;

export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
export type UpdateAddressRequest = UpdateAddressDto;
export type UpdateAddressInput = z.input<typeof UpdateAddressSchema>;
