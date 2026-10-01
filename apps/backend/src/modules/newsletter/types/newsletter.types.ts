import type { NewsletterAudienceDto, NewsletterContent, NewsletterStats } from "@orgatick/contracts";

/** Admin identity recorded on campaigns and templates. */
export interface NewsletterActor {
  id: bigint;
  name: string;
}

/** Purpose of a self-service token. Scoping tokens by purpose stops a confirm link from unsubscribing someone. */
export type NewsletterTokenPurpose = "confirm" | "unsubscribe" | "manage";

export interface NewsletterTokenPayload {
  purpose: NewsletterTokenPurpose;
  subscriberUuid: string;
  /** Epoch seconds. Absent for non-expiring manage tokens. */
  expiresAt?: number;
}

/** Values substituted into merge tags and block content for one recipient. */
export interface NewsletterRenderContext {
  recipientId: string;
  firstName: string;
  email: string;
  listName: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  viewInBrowserUrl: string;
}

export interface RenderedNewsletterBody {
  html: string;
  text: string;
}

export interface RenderedNewsletter extends RenderedNewsletterBody {
  subject: string;
  previewText: string;
}

/** Counters used to refresh the denormalised campaign totals after a batch. */
export interface NewsletterCounters {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  failed: number;
}

export interface NewsletterStatsInput {
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  complainedCount: number;
  unsubscribedCount: number;
  failedCount: number;
}

export type { NewsletterAudienceDto, NewsletterContent, NewsletterStats };

/** Zeroed counter set, used when a campaign has no recipient rows yet. */
export const EMPTY_NEWSLETTER_STATS: NewsletterStats = {
  recipientCount: 0,
  sentCount: 0,
  deliveredCount: 0,
  openedCount: 0,
  clickedCount: 0,
  bouncedCount: 0,
  complainedCount: 0,
  unsubscribedCount: 0,
  failedCount: 0,
  openRate: 0,
  clickRate: 0,
  bounceRate: 0,
  unsubscribeRate: 0,
};

/** Round to 4 decimals so percentages are stable in JSON and in the admin UI. */
export function roundRate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10000) / 10000;
}
