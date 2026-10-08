import { z } from "zod";
import { NewsletterSubscriberSource, NewsletterSubscriberStatus } from "../enums/newsletter.enums.js";

const EmailSchema = z.email("Enter a valid email address").max(320, "Email is too long");

export const NewsletterPreferencesSchema = z.object({
  /** Topic categories the subscriber wants to receive. Empty array = all topics. */
  categories: z.array(z.string().trim().min(1).max(64)).max(30).default([]),
  /** Marketing/product emails. Transactional notices are unaffected. */
  marketing: z.boolean().default(true),
});

export type NewsletterPreferencesDto = z.infer<typeof NewsletterPreferencesSchema>;

export const SubscribeNewsletterSchema = z.object({
  email: EmailSchema,
  name: z.string().trim().max(120).optional(),
  /** Slug of the list to subscribe to. Defaults to the platform default list. */
  list: z.string().trim().min(1).max(80).optional(),
  source: z.enum(NewsletterSubscriberSource).default(NewsletterSubscriberSource.FOOTER),
  organizationId: z.string().trim().min(1).optional(),
  preferences: NewsletterPreferencesSchema.optional(),
  /** Honeypot field. Bots fill it in; humans never see it. */
  website: z.string().max(200).optional(),
});

export type SubscribeNewsletterDto = z.infer<typeof SubscribeNewsletterSchema>;

export const UpdateNewsletterPreferencesSchema = NewsletterPreferencesSchema;

export type UpdateNewsletterPreferencesDto = z.infer<typeof UpdateNewsletterPreferencesSchema>;

export const UpdateSubscriberStatusSchema = z.object({
  status: z.enum([
    NewsletterSubscriberStatus.SUBSCRIBED,
    NewsletterSubscriberStatus.UNSUBSCRIBED,
    NewsletterSubscriberStatus.PENDING,
  ]),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateSubscriberStatusDto = z.infer<typeof UpdateSubscriberStatusSchema>;

export const NewsletterSubscriberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  status: z.union([z.enum(NewsletterSubscriberStatus), z.array(z.enum(NewsletterSubscriberStatus))]).optional(),
  listId: z.string().trim().min(1).optional(),
  sortBy: z.enum(["created_at", "confirmed_at", "email", "name", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});

export type NewsletterSubscriberQueryDto = z.infer<typeof NewsletterSubscriberQuerySchema>;

export const CreateNewsletterListSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().trim().max(500).optional(),
  organizationId: z.string().trim().min(1).optional(),
  makeDefault: z.boolean().default(false),
});

export type CreateNewsletterListDto = z.infer<typeof CreateNewsletterListSchema>;

export const UpdateNewsletterListSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  makeDefault: z.boolean().optional(),
});

export type UpdateNewsletterListDto = z.infer<typeof UpdateNewsletterListSchema>;

export const BulkSubscriberActionSchema = z.object({
  subscriberIds: z.array(z.string().trim().min(1)).min(1, "Select at least one subscriber"),
  action: z.enum(["unsubscribe", "delete", "resubscribe"]),
});

export type BulkSubscriberActionDto = z.infer<typeof BulkSubscriberActionSchema>;
