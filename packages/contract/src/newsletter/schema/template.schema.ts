import { z } from "zod";
import { NewsletterTemplateStatus } from "../enums/newsletter.enums.js";
import { NewsletterContentBlocksSchema } from "./content.schema.js";

export const CreateNewsletterTemplateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().max(64).optional(),
  subject: z.string().trim().min(1).max(200),
  previewText: z.string().trim().max(300).optional(),
  /** A template created from an HTML override has no blocks; the list is then empty. */
  content: NewsletterContentBlocksSchema.default([]),
  /** Optional override so a designer can paste a hand-built HTML email. */
  htmlOverride: z.string().max(200000).optional(),
  status: z.enum(NewsletterTemplateStatus).default(NewsletterTemplateStatus.DRAFT),
});

export type CreateNewsletterTemplateDto = z.infer<typeof CreateNewsletterTemplateSchema>;

export const UpdateNewsletterTemplateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().max(64).nullable().optional(),
  subject: z.string().trim().min(1).max(200).optional(),
  previewText: z.string().trim().max(300).nullable().optional(),
  content: NewsletterContentBlocksSchema.optional(),
  htmlOverride: z.string().max(200000).nullable().optional(),
  status: z.enum(NewsletterTemplateStatus).optional(),
});

export type UpdateNewsletterTemplateDto = z.infer<typeof UpdateNewsletterTemplateSchema>;

export const NewsletterTemplateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  status: z.enum(NewsletterTemplateStatus).optional(),
  category: z.string().trim().max(64).optional(),
  sortBy: z.enum(["created_at", "name", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});

export type NewsletterTemplateQueryDto = z.infer<typeof NewsletterTemplateQuerySchema>;
