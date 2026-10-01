import { z } from "zod";

export const RejectDocumentSchema = z.object({
  reason: z.string().trim().min(3, "A rejection reason is required").max(500),
});
export type RejectDocumentDto = z.infer<typeof RejectDocumentSchema>;

export const RequestReplacementSchema = z.object({
  note: z.string().trim().min(3, "Explain what replacement is needed").max(500),
});
export type RequestReplacementDto = z.infer<typeof RequestReplacementSchema>;

export const NoteOnlySchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type NoteOnlyDto = z.infer<typeof NoteOnlySchema>;
