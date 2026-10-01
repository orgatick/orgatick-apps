import { z } from "zod";
import { createApiResponseSchema, createPaginatedApiResponseSchema } from "../../common/response.js";
import {
  NewsletterListScope,
  NewsletterSubscriberSource,
  NewsletterSubscriberStatus,
} from "../enums/newsletter.enums.js";

export const NewsletterListResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  scope: z.enum(NewsletterListScope),
  organizationId: z.string().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  subscriberCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NewsletterListResponse = z.infer<typeof NewsletterListResponseSchema>;

export const NewsletterSubscriberResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  status: z.enum(NewsletterSubscriberStatus),
  source: z.enum(NewsletterSubscriberSource),
  listId: z.string(),
  listName: z.string().nullable(),
  preferences: z.object({
    categories: z.array(z.string()),
    marketing: z.boolean(),
  }),
  isRegisteredUser: z.boolean(),
  organizationId: z.string().nullable(),
  subscribedAt: z.string().nullable(),
  confirmedAt: z.string().nullable(),
  unsubscribedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NewsletterSubscriberResponse = z.infer<typeof NewsletterSubscriberResponseSchema>;

export const NewsletterSubscriberStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  subscribed: z.number().int().nonnegative(),
  unsubscribed: z.number().int().nonnegative(),
  bounced: z.number().int().nonnegative(),
  complained: z.number().int().nonnegative(),
  /** subscribed / total, 0 when the list is empty. */
  growthRate: z.number().min(0).max(1),
});

export type NewsletterSubscriberStats = z.infer<typeof NewsletterSubscriberStatsSchema>;

export const PaginatedNewsletterSubscriberResponseSchema = createPaginatedApiResponseSchema(
  NewsletterSubscriberResponseSchema,
);
export type PaginatedNewsletterSubscriberResponse = z.infer<typeof PaginatedNewsletterSubscriberResponseSchema>;

export const SingleNewsletterSubscriberResponseSchema = createApiResponseSchema(NewsletterSubscriberResponseSchema);
export type SingleNewsletterSubscriberResponse = z.infer<typeof SingleNewsletterSubscriberResponseSchema>;

export const NewsletterSubscriberStatsResponseSchema = createApiResponseSchema(NewsletterSubscriberStatsSchema);
export type NewsletterSubscriberStatsResponse = z.infer<typeof NewsletterSubscriberStatsResponseSchema>;
