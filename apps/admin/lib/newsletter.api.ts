import type {
  NewsletterAction,
  NewsletterListResponse,
  NewsletterOverview,
  NewsletterRecipientResponse,
  NewsletterResponse,
  NewsletterStats,
  NewsletterSubscriberResponse,
  NewsletterSubscriberStats,
  NewsletterTemplateResponse,
} from "@orgatick/contracts";
import serverApi from "./apis/server-auth-api";
import type { ApiResponseData, Paginated } from "./types";
import api from "./apis/auth-base.api";

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

function cleanParams(query: object): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value as string | number;
    }
  }
  return cleaned;
}

// ---- Server helpers (Server Components / Server Actions) ----

export async function serverFetchNewsletters(query: NewsletterListQuery = {}): Promise<Paginated<NewsletterResponse>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<NewsletterResponse>>>("/admin/newsletters", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchNewsletter(id: string): Promise<NewsletterResponse> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<NewsletterResponse>>(`/admin/newsletters/${id}`);
  return response.data.data;
}

export async function serverFetchNewsletterRecipients(
  id: string,
  query: NewsletterRecipientListQuery = {},
): Promise<Paginated<NewsletterRecipientResponse>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<NewsletterRecipientResponse>>>(
    `/admin/newsletters/${id}/recipients`,
    { params: cleanParams(query) },
  );
  return response.data.data;
}

export async function serverFetchNewsletterOverview(id: string): Promise<NewsletterOverview> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<NewsletterOverview>>(`/admin/newsletters/${id}/overview`);
  return response.data.data;
}

export async function serverFetchNewsletterLists(): Promise<NewsletterListResponse[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<NewsletterListResponse[]>>("/admin/newsletter/lists");
  return response.data.data;
}

export async function serverFetchNewsletterTemplates(
  query: NewsletterTemplateListQuery = {},
): Promise<Paginated<NewsletterTemplateResponse>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<NewsletterTemplateResponse>>>(
    "/admin/newsletter/templates",
    {
      params: cleanParams(query),
    },
  );
  return response.data.data;
}

export async function serverFetchActiveTemplates(): Promise<NewsletterTemplateResponse[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<NewsletterTemplateResponse[]>>("/admin/newsletter/templates/active");
  return response.data.data;
}

export async function serverFetchNewsletterSubscribers(
  query: NewsletterSubscriberListQuery = {},
): Promise<Paginated<NewsletterSubscriberResponse>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<NewsletterSubscriberResponse>>>(
    "/admin/newsletter/subscribers",
    {
      params: cleanParams(query),
    },
  );
  return response.data.data;
}

export async function serverFetchNewsletterSubscriberStats(listId?: string): Promise<NewsletterSubscriberStats> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<NewsletterSubscriberStats>>("/admin/newsletter/subscribers/stats", {
    params: cleanParams({ listId }),
  });
  return response.data.data;
}

// ---- Mutations (browser) ----

export async function createNewsletter(payload: Record<string, unknown>): Promise<NewsletterResponse> {
  const response = await api.post<ApiResponseData<NewsletterResponse>>("/admin/newsletters", payload);
  return response.data.data;
}

export async function updateNewsletter(id: string, payload: Record<string, unknown>): Promise<NewsletterResponse> {
  const response = await api.patch<ApiResponseData<NewsletterResponse>>(`/admin/newsletters/${id}`, payload);
  return response.data.data;
}

export async function performNewsletterAction(
  id: string,
  action: NewsletterAction,
  payload: { scheduledAt?: string; reason?: string } = {},
): Promise<NewsletterResponse> {
  const response = await api.post<ApiResponseData<NewsletterResponse>>(`/admin/newsletters/${id}/actions`, {
    action,
    ...payload,
  });
  return response.data.data;
}

export async function deleteNewsletter(id: string): Promise<void> {
  await api.delete(`/admin/newsletters/${id}`);
}

/** Omit the name to let the backend default it to the campaign subject. */
export async function saveNewsletterAsTemplate(id: string, name?: string): Promise<{ id: string }> {
  const response = await api.post<ApiResponseData<{ id: string }>>(`/admin/newsletters/${id}/save-as-template`, {
    name: name?.trim() || undefined,
  });
  return response.data.data;
}

export async function updateSubscriberStatus(id: string, status: string, reason?: string): Promise<void> {
  await api.patch(`/admin/newsletter/subscribers/${id}/status`, { status, reason });
}

export async function createNewsletterList(payload: Record<string, unknown>): Promise<NewsletterListResponse> {
  const response = await api.post<ApiResponseData<NewsletterListResponse>>("/admin/newsletter/lists", payload);
  return response.data.data;
}

export async function updateNewsletterList(
  id: string,
  payload: Record<string, unknown>,
): Promise<NewsletterListResponse> {
  const response = await api.patch<ApiResponseData<NewsletterListResponse>>(
    `/admin/newsletter/lists/${id}`,
    payload,
  );
  return response.data.data;
}

export async function createNewsletterTemplate(payload: Record<string, unknown>): Promise<NewsletterTemplateResponse> {
  const response = await api.post<ApiResponseData<NewsletterTemplateResponse>>(
    "/admin/newsletter/templates",
    payload,
  );
  return response.data.data;
}

export async function updateNewsletterTemplate(
  id: string,
  payload: Record<string, unknown>,
): Promise<NewsletterTemplateResponse> {
  const response = await api.patch<ApiResponseData<NewsletterTemplateResponse>>(
    `/admin/newsletter/templates/${id}`,
    payload,
  );
  return response.data.data;
}

export async function setTemplateStatus(
  id: string,
  status: "publish" | "archive",
): Promise<NewsletterTemplateResponse> {
  const response = await api.post<ApiResponseData<NewsletterTemplateResponse>>(
    `/admin/newsletter/templates/${id}/${status}`,
  );
  return response.data.data;
}

export async function deleteNewsletterTemplate(id: string): Promise<void> {
  await api.delete(`/admin/newsletter/templates/${id}`);
}

/** Shared formatter for the campaign report cards. */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export type { NewsletterStats, NewsletterSubscriberStats };
