import { z } from "zod";
import {
  OrganizationBankAccountStatus,
  OrganizationBankAccountType,
} from "../enums/organization-bank-account-status.enum.js";

export const SaveOrganizationBankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(2, "Account holder name must be at least 2 characters")
    .max(255, "Account holder name too long"),
  accountNumber: z
    .string()
    .trim()
    .min(8, "Account number must be at least 8 characters")
    .max(35, "Account number cannot exceed 35 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Account number must contain only letters and numbers"),
  ifscCode: z
    .string()
    .trim()
    .min(4, "IFSC / Branch routing code must be at least 4 characters")
    .max(20, "IFSC / Branch routing code cannot exceed 20 characters")
    .toUpperCase(),
  bankName: z.string().trim().min(2, "Bank name must be at least 2 characters").max(255, "Bank name too long"),
  branchName: z.string().trim().max(255).nullish(),
  accountType: z
    .enum(Object.values(OrganizationBankAccountType) as [string, ...string[]])
    .default(OrganizationBankAccountType.CURRENT),
  documentId: z.string().nullish(),
});

export type SaveOrganizationBankAccountDto = z.infer<typeof SaveOrganizationBankAccountSchema>;

export const VerifyOrganizationBankAccountSchema = z.object({
  status: z.enum([OrganizationBankAccountStatus.VERIFIED, OrganizationBankAccountStatus.REJECTED]),
  verificationNotes: z.string().trim().max(500).nullish(),
});

export type VerifyOrganizationBankAccountDto = z.infer<typeof VerifyOrganizationBankAccountSchema>;
