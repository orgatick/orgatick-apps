import type { NewsletterListScope, NewsletterSubscriberSource, NewsletterSubscriberStatus } from "../enums/index.js";
import type {
  NewsletterListResponse,
  NewsletterSubscriberResponse,
  NewsletterSubscriberStats,
} from "../responses/index.js";

export interface NewsletterSubscriberEntityLike {
  id: bigint | string;
  email: string;
  name?: string | null;
  status: NewsletterSubscriberStatus;
  source: NewsletterSubscriberSource;
  listId: bigint | string;
  preferences: { categories: string[]; marketing: boolean };
  userId?: bigint | string | null;
  organizationId?: bigint | string | null;
  subscribedAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  unsubscribedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  list?: { name: string } | null;
}

export interface NewsletterListEntityLike {
  id: bigint | string;
  name: string;
  slug: string;
  description?: string | null;
  scope: NewsletterListScope;
  organizationId?: bigint | string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewsletterSubscriberCountsLike {
  total: number;
  pending: number;
  subscribed: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
}

export function toNewsletterSubscriberResponse(entity: NewsletterSubscriberEntityLike): NewsletterSubscriberResponse {
  return {
    id: String(entity.id),
    email: entity.email,
    name: entity.name ?? null,
    status: entity.status,
    source: entity.source,
    listId: String(entity.listId),
    listName: entity.list?.name ?? null,
    preferences: {
      categories: entity.preferences?.categories ?? [],
      marketing: entity.preferences?.marketing ?? true,
    },
    isRegisteredUser: entity.userId != null,
    organizationId: entity.organizationId == null ? null : String(entity.organizationId),
    subscribedAt: toIsoOrNull(entity.subscribedAt),
    confirmedAt: toIsoOrNull(entity.confirmedAt),
    unsubscribedAt: toIsoOrNull(entity.unsubscribedAt),
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

export function toNewsletterListResponse(
  entity: NewsletterListEntityLike,
  subscriberCount: number,
): NewsletterListResponse {
  return {
    id: String(entity.id),
    name: entity.name,
    slug: entity.slug,
    description: entity.description ?? null,
    scope: entity.scope,
    organizationId: entity.organizationId == null ? null : String(entity.organizationId),
    isDefault: entity.isDefault,
    isActive: entity.isActive,
    subscriberCount,
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

/** Growth rate is confirmed subscribers over the whole list, so it never exceeds 1. */
export function buildNewsletterSubscriberStats(counts: NewsletterSubscriberCountsLike): NewsletterSubscriberStats {
  const growthRate = counts.total > 0 ? Math.round((counts.subscribed / counts.total) * 10000) / 10000 : 0;

  return {
    total: counts.total,
    pending: counts.pending,
    subscribed: counts.subscribed,
    unsubscribed: counts.unsubscribed,
    bounced: counts.bounced,
    complained: counts.complained,
    growthRate,
  };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toIsoOrNull(value?: Date | string | null): string | null {
  if (!value) return null;
  return toIso(value);
}
