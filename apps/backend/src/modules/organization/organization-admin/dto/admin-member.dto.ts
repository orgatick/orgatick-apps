import { z } from "zod";
import { OrganizationMemberRoleSchema, MemberStatusSchema } from "./admin-verification.dto";

export const AddMemberSchema = z.object({
  userId: z.coerce.number().int().positive(),
  role: OrganizationMemberRoleSchema,
});
export type AddMemberDto = z.infer<typeof AddMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: OrganizationMemberRoleSchema,
});
export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;

export const UpdateMemberStatusSchema = z.object({
  status: MemberStatusSchema,
});
export type UpdateMemberStatusDto = z.infer<typeof UpdateMemberStatusSchema>;

export const TransferOwnershipSchema = z.object({
  toUserId: z.coerce.number().int().positive(),
  reason: z.string().trim().max(500).optional(),
});
export type TransferOwnershipDto = z.infer<typeof TransferOwnershipSchema>;
