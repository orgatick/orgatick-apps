import type { NewsletterTemplateResponse } from "@orgatick/contracts";
import api from "./apis/auth-base.api";
import serverApi from "./apis/server-auth-api";
import { cleanParams, type NewsletterTemplateListQuery } from "./newsletter-types";
import type { ApiResponseData, Paginated } from "./types";

export async function serverFetchNewsletterTemplates(
  query: NewsletterTemplateListQuery = {},
): Promise<Paginated<NewsletterTemplateResponse>> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<Paginated<NewsletterTemplateResponse>>>(
    "/admin/newsletter/templates",
    { params: cleanParams(query) },
  );
  return response.data.data;
}

export async function serverFetchActiveTemplates(): Promise<NewsletterTemplateResponse[]> {
  const sApi = await serverApi();
  const response = await sApi.get<ApiResponseData<NewsletterTemplateResponse[]>>("/admin/newsletter/templates/active");
  return response.data.data;
}

export async function createNewsletterTemplate(payload: Record<string, unknown>): Promise<NewsletterTemplateResponse> {
  const response = await api.post<ApiResponseData<NewsletterTemplateResponse>>("/admin/newsletter/templates", payload);
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
