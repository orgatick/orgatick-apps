import type {
  NewsletterListResponse,
  NewsletterSubscriberResponse,
  NewsletterSubscriberStats,
  SubscribeNewsletterResponse,
} from "@orgatick/contracts";
import api from "./apis/auth-base.api";
import serverApi from "./apis/server-auth-api";
import { cleanParams, type NewsletterSubscriberListQuery } from "./newsletter-types";
import type { ApiResponseData, Paginated } from "./types";

export async function serverFetchNewsletterLists(): Promise<NewsletterListResponse[]> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<NewsletterListResponse[]>>("/admin/newsletter/lists");
  return response.data.data;
}

export async function serverFetchNewsletterSubscribers(
  query: NewsletterSubscriberListQuery = {},
): Promise<Paginated<NewsletterSubscriberResponse>> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<Paginated<NewsletterSubscriberResponse>>>(
    "/admin/newsletter/subscribers",
    { params: cleanParams(query) },
  );
  return response.data.data;
}

export async function fetchNewsletterSubscribers(
  query: NewsletterSubscriberListQuery = {},
): Promise<Paginated<NewsletterSubscriberResponse>> {
  const response = await api.get<ApiResponseData<Paginated<NewsletterSubscriberResponse>>>(
    "/admin/newsletter/subscribers",
    { params: cleanParams(query) },
  );
  return response.data.data;
}

export async function serverFetchNewsletterSubscriberStats(listId?: string): Promise<NewsletterSubscriberStats> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<NewsletterSubscriberStats>>("/admin/newsletter/subscribers/stats", {
    params: cleanParams({ listId }),
  });
  return response.data.data;
}

export async function updateSubscriberStatus(id: string, status: string, reason?: string): Promise<void> {
  await api.patch(`/admin/newsletter/subscribers/${id}/status`, { status, reason });
}

export async function addNewsletterSubscriber(payload: {
  email: string;
  name?: string;
  list?: string;
}): Promise<SubscribeNewsletterResponse> {
  const response = await api.post<ApiResponseData<SubscribeNewsletterResponse>>(
    "/admin/newsletter/subscribers",
    payload,
  );
  return response.data.data;
}

export async function bulkSubscriberAction(
  subscriberIds: string[],
  action: "unsubscribe" | "delete" | "resubscribe",
): Promise<{ modified: number }> {
  const response = await api.post<ApiResponseData<{ modified: number }>>("/admin/newsletter/subscribers/bulk", {
    subscriberIds,
    action,
  });
  return response.data.data;
}

export async function createNewsletterList(payload: Record<string, unknown>): Promise<NewsletterListResponse> {
  const response = await api.post<ApiResponseData<NewsletterListResponse>>("/admin/newsletter/lists", payload);
  return response.data.data;
}

export async function updateNewsletterList(
  id: string,
  payload: Record<string, unknown>,
): Promise<NewsletterListResponse> {
  const response = await api.patch<ApiResponseData<NewsletterListResponse>>(`/admin/newsletter/lists/${id}`, payload);
  return response.data.data;
}

export async function deleteNewsletterList(id: string): Promise<void> {
  await api.delete(`/admin/newsletter/lists/${id}`);
}
