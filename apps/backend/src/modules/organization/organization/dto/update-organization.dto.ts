import { OrganizationSocialLinkInputSchema, OrganizationSupportContactInputSchema } from "@orgatick/contracts";
import { z } from "zod";
import { OrganizationStatus } from "../enums/organization-status.enum";

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(255).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  logo: z.string().max(1000).optional().nullable(),
  email: z.string().email("Invalid email format").max(320).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  status: z.nativeEnum(OrganizationStatus).optional(),
  allowPaidEvents: z.boolean().optional(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  subCategoryId: z.coerce.number().int().positive().optional().nullable(),
  addressId: z.coerce.number().int().positive().optional().nullable(),
  socialLinks: z.array(OrganizationSocialLinkInputSchema).optional(),
  supportContacts: z.array(OrganizationSupportContactInputSchema).optional(),
});

export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
