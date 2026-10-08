import type { NewsletterStats, NewsletterSubscriberStats } from "@orgatick/contracts";

export interface NewsletterListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  listId?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface NewsletterRecipientListQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface NewsletterSubscriberListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  listId?: string;
}

export interface NewsletterTemplateListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface NewsletterPreview {
  subject: string;
  html: string;
  text: string;
}

export function cleanParams(query: object): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value as string | number;
    }
  }
  return cleaned;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export type { NewsletterStats, NewsletterSubscriberStats };
