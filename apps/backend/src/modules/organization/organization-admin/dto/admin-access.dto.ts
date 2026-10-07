import { z } from "zod";

export const ReasonSchema = z.object({
  reason: z.string().trim().min(3, "A reason is required").max(500),
});
export type ReasonDto = z.infer<typeof ReasonSchema>;

export const OptionalReasonSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type OptionalReasonDto = z.infer<typeof OptionalReasonSchema>;

export const AdminNoteSchema = z.object({
  note: z.string().trim().min(1, "Note is required").max(2000),
});

export const OrganizationCapabilitySchema = z.enum(["event_creation", "registrations", "ticket_sales", "invitations"]);
export type OrganizationCapability = z.infer<typeof OrganizationCapabilitySchema>;

export const RestrictSchema = z.object({
  capabilities: z.array(OrganizationCapabilitySchema).min(1, "Select at least one capability"),
  reason: z.string().trim().min(3, "A reason is required").max(500),
});
export type RestrictDto = z.infer<typeof RestrictSchema>;

export const RemoveRestrictionsSchema = z.object({
  capabilities: z.array(OrganizationCapabilitySchema).min(1, "Select at least one capability"),
});
export type RemoveRestrictionsDto = z.infer<typeof RemoveRestrictionsSchema>;
export type AdminNoteDto = z.infer<typeof AdminNoteSchema>;

export const ClosureRequestSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
export type ClosureRequestDto = z.infer<typeof ClosureRequestSchema>;

export const ClosureDecisionSchema = z.object({
  note: z.string().trim().min(3).max(500).optional(),
  reason: z.string().trim().min(3).max(500).optional(),
});
export type ClosureDecisionDto = z.infer<typeof ClosureDecisionSchema>;
