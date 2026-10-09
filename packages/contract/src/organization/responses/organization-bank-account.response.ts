import { z } from "zod";
import { createApiResponseSchema } from "../../common/index.js";
import {
  OrganizationBankAccountStatus,
  OrganizationBankAccountType,
} from "../enums/organization-bank-account-status.enum.js";

export const OrganizationBankAccountResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  accountHolderName: z.string(),
  accountNumber: z.string().optional(),
  accountNumberMasked: z.string(),
  accountNumberLast4: z.string(),
  ifscCode: z.string(),
  bankName: z.string(),
  branchName: z.string().nullable().optional(),
  accountType: z.enum(Object.values(OrganizationBankAccountType) as [string, ...string[]]),
  status: z.enum(Object.values(OrganizationBankAccountStatus) as [string, ...string[]]),
  verificationNotes: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  verifiedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
});

export type OrganizationBankAccountResponse = z.infer<typeof OrganizationBankAccountResponseSchema>;

export const OrganizationBankAccountApiResponseSchema = createApiResponseSchema(
  OrganizationBankAccountResponseSchema.nullable(),
);
export type OrganizationBankAccountApiResponse = z.infer<typeof OrganizationBankAccountApiResponseSchema>;
