import type {
  NewsletterAction,
  NewsletterOverview,
  NewsletterRecipientResponse,
  NewsletterResponse,
} from "@orgatick/contracts";
import api from "./apis/auth-base.api";
import serverApi from "./apis/server-auth-api";
import { cleanParams, type NewsletterListQuery, type NewsletterRecipientListQuery } from "./newsletter-types";
import type { ApiResponseData, Paginated } from "./types";

export * from "./newsletter-types";
export * from "./newsletter-subscribers.api";
export * from "./newsletter-templates.api";

export async function serverFetchNewsletters(query: NewsletterListQuery = {}): Promise<Paginated<NewsletterResponse>> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<Paginated<NewsletterResponse>>>("/admin/newsletters", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchNewsletter(id: string): Promise<NewsletterResponse> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<NewsletterResponse>>(`/admin/newsletters/${id}`);
  return response.data.data;
}

export async function serverFetchNewsletterRecipients(
  id: string,
  query: NewsletterRecipientListQuery = {},
): Promise<Paginated<NewsletterRecipientResponse>> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<Paginated<NewsletterRecipientResponse>>>(
    `/admin/newsletters/${id}/recipients`,
    { params: cleanParams(query) },
  );
  return response.data.data;
}

export async function serverFetchNewsletterOverview(id: string): Promise<NewsletterOverview> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<NewsletterOverview>>(`/admin/newsletters/${id}/overview`);
  return response.data.data;
}

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

export async function sendTestEmail(id: string, email: string): Promise<{ sent: boolean; email: string }> {
  const response = await api.post<ApiResponseData<{ sent: boolean; email: string }>>(
    `/admin/newsletters/${id}/test-email`,
    { email },
  );
  return response.data.data;
}

export async function duplicateNewsletter(id: string, name?: string): Promise<NewsletterResponse> {
  const response = await api.post<ApiResponseData<NewsletterResponse>>(`/admin/newsletters/${id}/duplicate`, { name });
  return response.data.data;
}

export async function deleteNewsletter(id: string): Promise<void> {
  await api.delete(`/admin/newsletters/${id}`);
}

export async function saveNewsletterAsTemplate(id: string, name?: string): Promise<{ id: string }> {
  const response = await api.post<ApiResponseData<{ id: string }>>(`/admin/newsletters/${id}/save-as-template`, {
    name: name?.trim() || undefined,
  });
  return response.data.data;
}
