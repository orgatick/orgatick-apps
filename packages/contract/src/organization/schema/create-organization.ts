import { z } from "zod";
import { CreateAddressSchema } from "../../address";
import { OrganizationDocumentUploadSchema } from "./documents-upload";
import { OrganizationSocialLinkInputSchema } from "./social-link";
import { OrganizationSupportContactInputSchema } from "./support-contact";

export const BasicOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 3 characters")
    .max(255, "Organization name must not exceed 255 characters")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  categoryId: z.coerce.number().int().positive("Category ID must be a positive integer").optional().nullable(),
  subCategoryId: z.coerce.number().int().positive("Sub-category ID must be a positive integer"),
  description: z.string().max(5000).optional().nullable(),
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Logo must not exceed 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Logo must be a JPEG, PNG, or WebP image",
    )
    .optional()
    .nullable(),
  email: z.email("Invalid email format").max(320),
  phoneNumber: z.string().max(30),
});

export const CreateOrganizationSchema = z.object({
  basicInfo: BasicOrganizationSchema,
  address: CreateAddressSchema,
  document: z
    .array(OrganizationDocumentUploadSchema)
    .min(2, "At least 2 documents are required")
    .max(5, "No more than 5 documents are allowed"),
  socialLinks: z.array(OrganizationSocialLinkInputSchema).min(1).max(6),
  supportContacts: z.array(OrganizationSupportContactInputSchema).min(1).max(6),
});

export type CreateOrganizationInput = z.input<typeof CreateOrganizationSchema>;
export type CreateOrganizationOutput = z.output<typeof CreateOrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;

export type BasicOrganizationInput = z.input<typeof BasicOrganizationSchema>;
export type BasicOrganizationOutput = z.output<typeof BasicOrganizationSchema>;
export type BasicOrganization = z.infer<typeof BasicOrganizationSchema>;
