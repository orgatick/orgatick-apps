import { NewsletterSubscriberStatus, type SubscribeNewsletterDto } from "@orgatick/contracts";
import type { NewsletterRequestContext } from "../types/newsletter.types";
import { NewsletterSubscriber } from "../entities/newsletter-subscriber.entity";
import type { NewsletterList } from "../entities/newsletter-list.entity";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildNewSubscriber(
  list: NewsletterList,
  dto: SubscribeNewsletterDto,
  emailNormalized: string,
  context: NewsletterRequestContext,
  tokenHash: string,
): NewsletterSubscriber {
  const s = new NewsletterSubscriber();
  s.listId = list.id;
  s.email = dto.email.trim();
  s.emailNormalized = emailNormalized;
  s.name = dto.name ?? null;
  s.status = NewsletterSubscriberStatus.PENDING;
  s.source = dto.source;
  s.preferences = dto.preferences ?? { categories: [], marketing: true };
  s.attributes = {};
  s.ipAddress = context.ipAddress ?? null;
  s.userAgent = context.userAgent ?? null;
  s.userId = context.userId ?? null;
  s.organizationId = dto.organizationId ? BigInt(dto.organizationId) : null;
  s.unsubscribeTokenHash = tokenHash;
  return s;
}

export function reopenSubscriber(
  existing: NewsletterSubscriber,
  dto: SubscribeNewsletterDto,
  context: NewsletterRequestContext,
): NewsletterSubscriber {
  existing.email = dto.email;
  existing.name = dto.name ?? existing.name;
  existing.source = dto.source;
  existing.status = NewsletterSubscriberStatus.PENDING;
  existing.unsubscribedAt = null;
  existing.confirmedAt = null;
  existing.ipAddress = context.ipAddress ?? existing.ipAddress;
  existing.userAgent = context.userAgent ?? existing.userAgent;
  existing.userId = context.userId ?? existing.userId;
  existing.organizationId = dto.organizationId ? BigInt(dto.organizationId) : existing.organizationId;
  if (dto.preferences) existing.preferences = dto.preferences;
  return existing;
}
