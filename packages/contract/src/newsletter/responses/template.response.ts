import { z } from "zod";
import { createApiResponseSchema, createPaginatedApiResponseSchema } from "../../common/response.js";
import { NewsletterTemplateStatus } from "../enums/newsletter.enums.js";
import { NewsletterContentBlocksSchema } from "../schema/content.schema.js";
import { NewsletterListResponseSchema } from "./subscriber.response.js";

export const NewsletterTemplateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  subject: z.string(),
  previewText: z.string().nullable(),
  content: NewsletterContentBlocksSchema,
  hasHtmlOverride: z.boolean(),
  status: z.enum(NewsletterTemplateStatus),
  usageCount: z.number().int().nonnegative(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NewsletterTemplateResponse = z.infer<typeof NewsletterTemplateResponseSchema>;

export const PaginatedNewsletterTemplateResponseSchema = createPaginatedApiResponseSchema(
  NewsletterTemplateResponseSchema,
);
export type PaginatedNewsletterTemplateResponse = z.infer<typeof PaginatedNewsletterTemplateResponseSchema>;

export const SingleNewsletterTemplateResponseSchema = createApiResponseSchema(NewsletterTemplateResponseSchema);
export type SingleNewsletterTemplateResponse = z.infer<typeof SingleNewsletterTemplateResponseSchema>;

export const PaginatedNewsletterListResponseSchema = createPaginatedApiResponseSchema(NewsletterListResponseSchema);
export type PaginatedNewsletterListResponse = z.infer<typeof PaginatedNewsletterListResponseSchema>;
