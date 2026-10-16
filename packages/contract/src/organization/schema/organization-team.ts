import { z } from "zod";

export const OrganizationMemberStatusFilterSchema = z.enum(["active", "inactive"]);
export type OrganizationMemberStatusFilter = z.infer<typeof OrganizationMemberStatusFilterSchema>;

export const OrganizationMemberQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: OrganizationMemberStatusFilterSchema.optional(),
});
export type OrganizationMemberQuery = z.infer<typeof OrganizationMemberQuerySchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(100),
});
export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;

export const UpdateMemberStatusSchema = z.object({
  status: OrganizationMemberStatusFilterSchema,
});
export type UpdateMemberStatus = z.infer<typeof UpdateMemberStatusSchema>;

export const InvitationStatusFilterSchema = z.enum(["pending", "accepted", "rejected", "expired", "cancelled"]);
export type InvitationStatusFilter = z.infer<typeof InvitationStatusFilterSchema>;

export const OrganizationInvitationQuerySchema = z.object({
  status: InvitationStatusFilterSchema.optional(),
});
export type OrganizationInvitationQuery = z.infer<typeof OrganizationInvitationQuerySchema>;

export const CreateOrganizationInvitationSchema = z.object({
  email: z.email("Invalid email format").max(320),
  role: z.string().trim().min(1, "Role is required").max(100),
});
export type CreateOrganizationInvitation = z.infer<typeof CreateOrganizationInvitationSchema>;

export const InvitationTokenSchema = z
  .string()
  .min(32, "Invalid invitation token")
  .max(128, "Invalid invitation token")
  .regex(/^[a-f0-9]+$/, "Invalid invitation token");
export type InvitationToken = z.infer<typeof InvitationTokenSchema>;

export const AddOrganizationMemberSchema = z.object({
  email: z.email("Invalid email format").max(320),
  role: z.string().trim().min(1, "Role is required").max(100),
});
export type AddOrganizationMember = z.infer<typeof AddOrganizationMemberSchema>;

export const OrganizationCandidateUserQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});
export type OrganizationCandidateUserQuery = z.infer<typeof OrganizationCandidateUserQuerySchema>;

export const CreateOrganizationRoleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  permissions: z.array(z.string().trim().min(1)).min(1, "Select at least one permission"),
});
export type CreateOrganizationRole = z.infer<typeof CreateOrganizationRoleSchema>;

export const UpdateOrganizationRoleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters").max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  permissions: z.array(z.string().trim().min(1)).min(1, "Select at least one permission").optional(),
});
export type UpdateOrganizationRole = z.infer<typeof UpdateOrganizationRoleSchema>;
