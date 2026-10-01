import { z } from "zod";

export const VerificationApproveSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type VerificationApproveDto = z.infer<typeof VerificationApproveSchema>;

export const VerificationRejectSchema = z.object({
  reason: z.string().trim().min(3, "A rejection reason is required").max(500),
});
export type VerificationRejectDto = z.infer<typeof VerificationRejectSchema>;

export const VerificationRevokeSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type VerificationRevokeDto = z.infer<typeof VerificationRevokeSchema>;

export const VerificationDocumentsSchema = z.object({
  note: z.string().trim().min(3, "Explain what documents are needed").max(500),
});
export type VerificationDocumentsDto = z.infer<typeof VerificationDocumentsSchema>;

export const OrganizationMemberRoleSchema = z.enum(["owner", "admin", "manager", "member"]);
export type OrganizationMemberRoleDto = z.infer<typeof OrganizationMemberRoleSchema>;

export const MemberStatusSchema = z.enum(["active", "inactive"]);
export type MemberStatusDto = z.infer<typeof MemberStatusSchema>;
