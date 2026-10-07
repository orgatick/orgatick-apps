import { z } from "zod";
import { OrganizationReportCategory, OrganizationReportStatus } from "../enums/organization-report-status.enum";

export const SubmitReportSchema = z.object({
  category: z.enum(Object.values(OrganizationReportCategory)),
  description: z.string().trim().min(10, "Describe the issue in detail (at least 10 characters)").max(2000),
  evidenceUrls: z.array(z.string().trim().url().max(600)).max(5).optional(),
});
export type SubmitReportDto = z.infer<typeof SubmitReportSchema>;

export const AdminReportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(Object.values(OrganizationReportStatus)).optional(),
  category: z.enum(Object.values(OrganizationReportCategory)).optional(),
});
export type AdminReportQueryDto = z.infer<typeof AdminReportQuerySchema>;

export const UpdateReportStatusSchema = z.object({
  status: z.enum([OrganizationReportStatus.OPEN, OrganizationReportStatus.INVESTIGATING]),
});
export type UpdateReportStatusDto = z.infer<typeof UpdateReportStatusSchema>;

export const ResolveReportSchema = z.object({
  resolution: z.string().trim().min(3).max(2000),
});
export type ResolveReportDto = z.infer<typeof ResolveReportSchema>;

export const RejectReportSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
export type RejectReportDto = z.infer<typeof RejectReportSchema>;
