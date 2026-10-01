import type { NewsletterAudienceDto, NewsletterContent } from "../schema/index.js";
import type { NewsletterResponse, NewsletterRecipientResponse, NewsletterStats } from "../responses/index.js";

/** Structural view of the campaign row, so the mapper does not depend on the TypeORM entity. */
export interface NewsletterEntityLike {
  id: bigint | string;
  listId: bigint | string;
  templateId?: bigint | string | null;
  name: string;
  subject: string;
  previewText?: string | null;
  content: NewsletterContent;
  htmlOverride?: string | null;
  textOverride?: string | null;
  status: NewsletterResponse["status"];
  audience: NewsletterAudienceDto;
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
  scheduledAt?: Date | string | null;
  startedAt?: Date | string | null;
  sentAt?: Date | string | null;
  completedAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  errorMessage?: string | null;
  createdBy?: bigint | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  list?: { name: string; slug: string } | null;
  template?: { name: string } | null;
  creator?: { name: string } | null;
}

/** Counters stored on the campaign row; rates are derived here so the admin never computes them. */
export interface NewsletterCountersLike {
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  sentCount?: number;
  complainedCount?: number;
  failedCount?: number;
}

export interface NewsletterRecipientEntityLike {
  id: bigint | string;
  newsletterId: bigint | string;
  subscriberId?: bigint | string | null;
  email: string;
  status: string;
  providerMessageId?: string | null;
  queuedAt?: Date | string | null;
  sentAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  openedAt?: Date | string | null;
  clickedAt?: Date | string | null;
  unsubscribedAt?: Date | string | null;
  bouncedAt?: Date | string | null;
  openCount: number;
  clickCount: number;
  attemptCount: number;
  lastError?: string | null;
  createdAt: Date | string;
}

/** Safe ratio that treats "nothing sent" as 0 instead of NaN. */
export function rate(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0 || numerator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 10000;
}

export function buildNewsletterStats(counters: NewsletterCountersLike): NewsletterStats {
  const sentCount = counters.sentCount ?? counters.deliveredCount;

  return {
    recipientCount: counters.recipientCount,
    sentCount,
    deliveredCount: counters.deliveredCount,
    openedCount: counters.openedCount,
    clickedCount: counters.clickedCount,
    bouncedCount: counters.bouncedCount,
    complainedCount: counters.complainedCount ?? 0,
    unsubscribedCount: counters.unsubscribedCount,
    failedCount: counters.failedCount ?? 0,
    openRate: rate(counters.openedCount, counters.deliveredCount),
    clickRate: rate(counters.clickedCount, counters.deliveredCount),
    bounceRate: rate(counters.bouncedCount, sentCount),
    unsubscribeRate: rate(counters.unsubscribedCount, counters.deliveredCount),
  };
}

export function toNewsletterResponse(entity: NewsletterEntityLike, stats: NewsletterStats): NewsletterResponse {
  return {
    id: String(entity.id),
    name: entity.name,
    subject: entity.subject,
    previewText: entity.previewText ?? null,
    status: entity.status,
    listId: String(entity.listId),
    listName: entity.list?.name ?? null,
    listSlug: entity.list?.slug ?? null,
    templateId: entity.templateId == null ? null : String(entity.templateId),
    templateName: entity.template?.name ?? null,
    content: entity.content,
    hasHtmlOverride: Boolean(entity.htmlOverride),
    hasTextOverride: Boolean(entity.textOverride),
    fromName: entity.fromName,
    fromEmail: entity.fromEmail,
    replyTo: entity.replyTo ?? null,
    audience: entity.audience ?? {},
    scheduledAt: toIsoOrNull(entity.scheduledAt),
    startedAt: toIsoOrNull(entity.startedAt),
    sentAt: toIsoOrNull(entity.sentAt),
    completedAt: toIsoOrNull(entity.completedAt),
    cancelledAt: toIsoOrNull(entity.cancelledAt),
    errorMessage: entity.errorMessage ?? null,
    stats,
    createdBy: entity.createdBy == null ? null : String(entity.createdBy),
    createdByName: entity.creator?.name ?? null,
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

export function toNewsletterRecipientResponse(entity: NewsletterRecipientEntityLike): NewsletterRecipientResponse {
  return {
    id: String(entity.id),
    newsletterId: String(entity.newsletterId),
    subscriberId: entity.subscriberId == null ? null : String(entity.subscriberId),
    email: entity.email,
    status: entity.status,
    providerMessageId: entity.providerMessageId ?? null,
    queuedAt: toIsoOrNull(entity.queuedAt),
    sentAt: toIsoOrNull(entity.sentAt),
    deliveredAt: toIsoOrNull(entity.deliveredAt),
    openedAt: toIsoOrNull(entity.openedAt),
    clickedAt: toIsoOrNull(entity.clickedAt),
    unsubscribedAt: toIsoOrNull(entity.unsubscribedAt),
    bouncedAt: toIsoOrNull(entity.bouncedAt),
    openCount: entity.openCount,
    clickCount: entity.clickCount,
    attemptCount: entity.attemptCount,
    lastError: entity.lastError ?? null,
    createdAt: toIso(entity.createdAt),
  };
}

export function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function toIsoOrNull(value?: Date | string | null): string | null {
  if (!value) return null;
  return toIso(value);
}
