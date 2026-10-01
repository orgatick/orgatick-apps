import type { NewsletterContent } from "../schema/index.js";
import type { NewsletterTemplateResponse } from "../responses/index.js";

export interface NewsletterTemplateEntityLike {
  id: bigint | string;
  name: string;
  description?: string | null;
  category?: string | null;
  subject: string;
  previewText?: string | null;
  content: NewsletterContent;
  htmlOverride?: string | null;
  status: NewsletterTemplateResponse["status"];
  createdBy?: bigint | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/** Usage count is supplied by the caller so the mapper stays free of query concerns. */
export function toNewsletterTemplateResponse(
  entity: NewsletterTemplateEntityLike,
  usageCount = 0,
): NewsletterTemplateResponse {
  return {
    id: String(entity.id),
    name: entity.name,
    description: entity.description ?? null,
    category: entity.category ?? null,
    subject: entity.subject,
    previewText: entity.previewText ?? null,
    content: entity.content,
    hasHtmlOverride: Boolean(entity.htmlOverride),
    status: entity.status,
    usageCount,
    createdBy: entity.createdBy == null ? null : String(entity.createdBy),
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
