import { z } from "zod";
import { NewsletterAction, NewsletterStatus } from "../enums/newsletter.enums.js";
import { NewsletterContentSchema } from "./content.schema.js";

const EmailSchema = z.email("Enter a valid email address").max(320, "Email is too long");

/** Audience filter applied when building the recipient queue for a campaign. */
export const NewsletterAudienceSchema = z.object({
  /** Only send to subscribers confirmed on/after this date. */
  subscribedAfter: z.iso.datetime().optional(),
  /** Only send to subscribers confirmed before this date. */
  subscribedBefore: z.iso.datetime().optional(),
  /** Restrict to these preference categories (empty/undefined = all categories). */
  categories: z.array(z.string().trim().min(1).max(64)).max(30).optional(),
  /** Restrict to subscribers linked to a registered user. */
  onlyRegisteredUsers: z.boolean().default(false),
  /** Upper bound on recipients for a single send. */
  limit: z.number().int().min(1).max(500000).optional(),
});

export type NewsletterAudienceDto = z.infer<typeof NewsletterAudienceSchema>;

export const CreateNewsletterSchema = z.object({
  /** Internal name, defaults to the subject line when omitted. */
  name: z.string().trim().min(1).max(200).optional(),
  subject: z.string().trim().min(1).max(200, "Subject is too long"),
  previewText: z.string().trim().max(300).optional(),
  listId: z.string().trim().min(1, "Select a mailing list"),
  templateId: z.string().trim().min(1).optional(),
  content: NewsletterContentSchema.optional(),
  /** Advanced escape hatch: replaces the rendered block content. Sanitised on render. */
  htmlOverride: z.string().max(200000).optional(),
  /** Advanced escape hatch: replaces the generated plain-text alternative. */
  textOverride: z.string().max(100000).optional(),
  fromName: z.string().trim().min(1).max(120),
  fromEmail: EmailSchema,
  replyTo: EmailSchema.optional(),
  audience: NewsletterAudienceSchema.optional(),
  /** When set and status is left as draft, the campaign is scheduled for this instant. */
  scheduledAt: z.iso.datetime().optional(),
  /** Send immediately on create instead of saving a draft. */
  sendNow: z.boolean().default(false),
});

export type CreateNewsletterDto = z.infer<typeof CreateNewsletterSchema>;

export const UpdateNewsletterSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  subject: z.string().trim().min(1).max(200).optional(),
  previewText: z.string().trim().max(300).optional(),
  listId: z.string().trim().min(1).optional(),
  templateId: z.string().trim().min(1).nullable().optional(),
  content: NewsletterContentSchema.optional(),
  htmlOverride: z.string().max(200000).nullable().optional(),
  textOverride: z.string().max(100000).nullable().optional(),
  fromName: z.string().trim().min(1).max(120).optional(),
  fromEmail: EmailSchema.optional(),
  replyTo: EmailSchema.nullable().optional(),
  audience: NewsletterAudienceSchema.optional(),
});

export type UpdateNewsletterDto = z.infer<typeof UpdateNewsletterSchema>;

export const NewsletterActionSchema = z.object({
  action: z.enum(NewsletterAction),
  /** Required when scheduling or rescheduling. */
  scheduledAt: z.iso.datetime().optional(),
  /** Optional reason recorded in the activity log. */
  reason: z.string().trim().max(500).optional(),
});

export type NewsletterActionDto = z.infer<typeof NewsletterActionSchema>;

export const NewsletterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  status: z.union([z.enum(NewsletterStatus), z.array(z.enum(NewsletterStatus))]).optional(),
  listId: z.string().trim().min(1).optional(),
  sortBy: z.enum(["created_at", "scheduled_at", "sent_at", "subject", "id"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});

export type NewsletterQueryDto = z.infer<typeof NewsletterQuerySchema>;

export const NewsletterRecipientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["queued", "sent", "delivered", "opened", "clicked", "bounced", "failed"]).optional(),
  search: z.string().trim().max(255).optional(),
  sortBy: z.enum(["created_at", "sent_at", "opened_at", "email"]).default("created_at"),
  sortOrder: z.enum(["ASC", "DESC", "asc", "desc"]).default("DESC"),
});

export type NewsletterRecipientQueryDto = z.infer<typeof NewsletterRecipientQuerySchema>;
