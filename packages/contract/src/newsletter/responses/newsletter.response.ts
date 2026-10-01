import { z } from "zod";
import { createApiResponseSchema, createPaginatedApiResponseSchema } from "../../common/response.js";
import { NewsletterStatus } from "../enums/newsletter.enums.js";
import { NewsletterContentSchema, type NewsletterContent } from "../schema/content.schema.js";
import type { NewsletterAudienceDto } from "../schema/newsletter.schema.js";

/** Delivery counters plus the rates derived from them. */
export const NewsletterStatsSchema = z.object({
  recipientCount: z.number().int().nonnegative(),
  sentCount: z.number().int().nonnegative(),
  deliveredCount: z.number().int().nonnegative(),
  openedCount: z.number().int().nonnegative(),
  clickedCount: z.number().int().nonnegative(),
  bouncedCount: z.number().int().nonnegative(),
  complainedCount: z.number().int().nonnegative(),
  unsubscribedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  /** openedCount / deliveredCount, 0 when nothing was delivered. */
  openRate: z.number().min(0).max(1),
  /** clickedCount / deliveredCount, 0 when nothing was delivered. */
  clickRate: z.number().min(0).max(1),
  /** bouncedCount / sentCount, 0 when nothing was sent. */
  bounceRate: z.number().min(0).max(1),
  /** unsubscribedCount / deliveredCount, 0 when nothing was delivered. */
  unsubscribeRate: z.number().min(0).max(1),
});

export type NewsletterStats = z.infer<typeof NewsletterStatsSchema>;

export const NewsletterResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  previewText: z.string().nullable(),
  status: z.enum(NewsletterStatus),
  listId: z.string(),
  listName: z.string().nullable(),
  listSlug: z.string().nullable(),
  templateId: z.string().nullable(),
  templateName: z.string().nullable(),
  content: NewsletterContentSchema,
  hasHtmlOverride: z.boolean(),
  hasTextOverride: z.boolean(),
  fromName: z.string(),
  fromEmail: z.string(),
  replyTo: z.string().nullable(),
  audience: z.custom<NewsletterAudienceDto>(),
  scheduledAt: z.string().nullable(),
  startedAt: z.string().nullable(),
  sentAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
  stats: NewsletterStatsSchema,
  createdBy: z.string().nullable(),
  createdByName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NewsletterResponse = Omit<z.infer<typeof NewsletterResponseSchema>, "content"> & {
  content: NewsletterContent;
};

export const NewsletterRecipientResponseSchema = z.object({
  id: z.string(),
  newsletterId: z.string(),
  subscriberId: z.string().nullable(),
  email: z.string(),
  status: z.string(),
  providerMessageId: z.string().nullable(),
  queuedAt: z.string().nullable(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  openedAt: z.string().nullable(),
  clickedAt: z.string().nullable(),
  unsubscribedAt: z.string().nullable(),
  bouncedAt: z.string().nullable(),
  openCount: z.number().int().nonnegative(),
  clickCount: z.number().int().nonnegative(),
  attemptCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
});

export type NewsletterRecipientResponse = z.infer<typeof NewsletterRecipientResponseSchema>;

export const NewsletterRecipientStatusResponseSchema = z.object({
  newsletterId: z.string(),
  status: z.enum(NewsletterStatus),
  stats: NewsletterStatsSchema,
});

export type NewsletterRecipientStatusResponse = z.infer<typeof NewsletterRecipientStatusResponseSchema>;

export const NewsletterOverviewSchema = z.object({
  stats: NewsletterStatsSchema,
  statusBreakdown: z.array(z.object({ status: z.string(), count: z.number().int().nonnegative() })),
  topLinks: z.array(z.object({ url: z.string(), count: z.number().int().nonnegative() })),
  sendsByDay: z.array(z.object({ date: z.string(), count: z.number().int().nonnegative() })),
});

export type NewsletterOverview = z.infer<typeof NewsletterOverviewSchema>;

export const PaginatedNewsletterResponseSchema = createPaginatedApiResponseSchema(NewsletterResponseSchema);
export type PaginatedNewsletterResponse = z.infer<typeof PaginatedNewsletterResponseSchema>;

export const SingleNewsletterResponseSchema = createApiResponseSchema(NewsletterResponseSchema);
export type SingleNewsletterResponse = z.infer<typeof SingleNewsletterResponseSchema>;

export const PaginatedNewsletterRecipientResponseSchema = createPaginatedApiResponseSchema(
  NewsletterRecipientResponseSchema,
);
export type PaginatedNewsletterRecipientResponse = z.infer<typeof PaginatedNewsletterRecipientResponseSchema>;
