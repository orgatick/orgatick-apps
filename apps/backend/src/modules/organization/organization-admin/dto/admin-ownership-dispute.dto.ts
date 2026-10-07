import { z } from "zod";
import { OwnershipDisputeStatus } from "../enums/ownership-dispute-status.enum";

export const SubmitDisputeSchema = z.object({
  reason: z.string().trim().min(10, "Explain your claim (at least 10 characters)").max(2000),
  evidenceUrls: z.array(z.string().trim().url().max(600)).max(5).optional(),
});
export type SubmitDisputeDto = z.infer<typeof SubmitDisputeSchema>;

export const OwnershipDisputeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(OwnershipDisputeStatus)).optional(),
});
export type OwnershipDisputeQueryDto = z.infer<typeof OwnershipDisputeQuerySchema>;

export const UpdateDisputeStatusSchema = z.object({
  status: z.enum([OwnershipDisputeStatus.OPEN, OwnershipDisputeStatus.INVESTIGATING]),
});
export type UpdateDisputeStatusDto = z.infer<typeof UpdateDisputeStatusSchema>;

export const FreezeDisputeSchema = z.object({
  frozen: z.boolean(),
});
export type FreezeDisputeDto = z.infer<typeof FreezeDisputeSchema>;

export const ResolveDisputeSchema = z.object({
  resolution: z.string().trim().min(3).max(2000),
  toUserId: z.coerce.number().int().positive().optional(),
});
export type ResolveDisputeDto = z.infer<typeof ResolveDisputeSchema>;

export const RejectDisputeSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
export type RejectDisputeDto = z.infer<typeof RejectDisputeSchema>;
