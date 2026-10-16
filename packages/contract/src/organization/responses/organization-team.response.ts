import { z } from "zod";
import { createApiResponseSchema } from "../../common/index.js";

export const OrganizationRoleOptionResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isCustom: z.boolean().optional(),
  memberCount: z.number().optional(),
  permissions: z.array(z.string()).optional(),
});
export type OrganizationRoleOptionResponse = z.infer<typeof OrganizationRoleOptionResponseSchema>;

export const OrganizationMemberUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
});
export type OrganizationMemberUserResponse = z.infer<typeof OrganizationMemberUserResponseSchema>;

export const OrganizationMemberResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.string(),
  joinedAt: z.string().nullable(),
  createdAt: z.string().datetime(),
  user: OrganizationMemberUserResponseSchema,
  role: OrganizationRoleOptionResponseSchema.pick({ id: true, key: true, name: true }),
});
export type OrganizationMemberResponse = z.infer<typeof OrganizationMemberResponseSchema>;

export const OrganizationMemberListResponseSchema = createApiResponseSchema(z.array(OrganizationMemberResponseSchema));
export type OrganizationMemberListResponse = z.infer<typeof OrganizationMemberListResponseSchema>;

export const OrganizationRoleListResponseSchema = createApiResponseSchema(
  z.array(OrganizationRoleOptionResponseSchema),
);
export type OrganizationRoleListResponse = z.infer<typeof OrganizationRoleListResponseSchema>;

export const EffectivePermissionsResponseSchema = z.object({
  role: OrganizationRoleOptionResponseSchema.pick({ id: true, key: true, name: true }).nullable(),
  permissions: z.array(z.string()),
});
export type EffectivePermissionsResponse = z.infer<typeof EffectivePermissionsResponseSchema>;

export const OrganizationInvitedByResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const OrganizationInvitationResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  createdAt: z.string().datetime(),
  invitedBy: OrganizationInvitedByResponseSchema.nullable(),
});
export type OrganizationInvitationResponse = z.infer<typeof OrganizationInvitationResponseSchema>;

export const OrganizationInvitationListResponseSchema = createApiResponseSchema(
  z.array(OrganizationInvitationResponseSchema),
);
export type OrganizationInvitationListResponse = z.infer<typeof OrganizationInvitationListResponseSchema>;

export const OrganizationInvitationPreviewResponseSchema = createApiResponseSchema(
  z.object({
    organization: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logo: z.string().nullable(),
    }),
    email: z.string(),
    role: z.string(),
    status: z.string(),
    expiresAt: z.string().datetime(),
    inviterName: z.string().nullable(),
  }),
);
export type OrganizationInvitationPreviewResponse = z.infer<typeof OrganizationInvitationPreviewResponseSchema>;

export const OrganizationVerificationRequestResponseSchema = createApiResponseSchema(
  z.object({
    organizationId: z.string(),
    status: z.string(),
    rejectionReason: z.string().nullable(),
    verifiedAt: z.string().nullable(),
  }),
);
export type OrganizationVerificationRequestResponse = z.infer<typeof OrganizationVerificationRequestResponseSchema>;

export const OrganizationCandidateUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  isMember: z.boolean(),
  isInvited: z.boolean().optional(),
});
export type OrganizationCandidateUserResponse = z.infer<typeof OrganizationCandidateUserResponseSchema>;

export const OrganizationCandidateUserListResponseSchema = createApiResponseSchema(
  z.array(OrganizationCandidateUserResponseSchema),
);
export type OrganizationCandidateUserListResponse = z.infer<typeof OrganizationCandidateUserListResponseSchema>;

export const OrganizationPermissionOptionResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  resource: z.string(),
  action: z.string(),
});
export type OrganizationPermissionOptionResponse = z.infer<typeof OrganizationPermissionOptionResponseSchema>;

export const OrganizationPermissionListResponseSchema = createApiResponseSchema(
  z.array(OrganizationPermissionOptionResponseSchema),
);
export type OrganizationPermissionListResponse = z.infer<typeof OrganizationPermissionListResponseSchema>;

export const OrganizationRoleDetailResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isCustom: z.boolean(),
  memberCount: z.number().optional(),
  permissions: z.array(z.string()),
  createdAt: z.string().datetime().optional(),
});
export type OrganizationRoleDetailResponse = z.infer<typeof OrganizationRoleDetailResponseSchema>;

export const OrganizationRoleDetailListResponseSchema = createApiResponseSchema(
  z.array(OrganizationRoleDetailResponseSchema),
);
export type OrganizationRoleDetailListResponse = z.infer<typeof OrganizationRoleDetailListResponseSchema>;
