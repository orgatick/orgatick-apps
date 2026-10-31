import baseApi from "./apis/base.api";
import serverApi from "./apis/server-auth-api";
import type { ApiResponseData } from "./types";

export interface AdminCatalogPlan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  tierLevel: number;
  isActive: boolean;
  isPublic: boolean;
  prices?: {
    id: string;
    billingInterval: "month" | "year" | "none";
    priceInMinorUnits: string;
    currency: string;
  }[];
  features?: {
    id: string;
    isIncluded: boolean;
    featureLevel?: string | null;
    feature: {
      code: string;
      name: string;
      category: string;
    };
  }[];
  limits?: {
    id: string;
    isUnlimited: boolean;
    limitValue?: string | null;
    limitDefinition: {
      code: string;
      name: string;
      limitScope: string;
      unit: string;
    };
  }[];
}

export interface AdminCatalogFeature {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface AdminCatalogLimit {
  id: string;
  code: string;
  name: string;
  limitScope: string;
  metricType: string;
  unit: string;
}

export async function serverFetchSubscriptionPlans(): Promise<AdminCatalogPlan[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<AdminCatalogPlan[]>>("/admin/subscriptions/plans");
  return response.data.data;
}

export async function serverFetchFeatures(): Promise<AdminCatalogFeature[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<AdminCatalogFeature[]>>("/admin/subscriptions/features");
  return response.data.data;
}

export async function serverFetchLimitDefinitions(): Promise<AdminCatalogLimit[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<AdminCatalogLimit[]>>("/admin/subscriptions/limits");
  return response.data.data;
}

export async function serverFetchAddons(): Promise<unknown[]> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<unknown[]>>("/admin/subscriptions/addons");
  return response.data.data;
}

export async function serverFetchOrgSubscription(orgId: string): Promise<unknown> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<unknown>>(`/admin/subscriptions/organizations/${orgId}`);
  return response.data.data;
}

export async function adminAssignPlan(orgId: string, planId: string, reason?: string): Promise<unknown> {
  const response = await baseApi.post<ApiResponseData<unknown>>(`/admin/subscriptions/organizations/${orgId}/assign`, {
    planId,
    reason,
  });
  return response.data.data;
}

export async function adminCreateOverride(orgId: string, data: Record<string, unknown>): Promise<unknown> {
  const response = await baseApi.post<ApiResponseData<unknown>>(
    `/admin/subscriptions/organizations/${orgId}/overrides`,
    data,
  );
  return response.data.data;
}
