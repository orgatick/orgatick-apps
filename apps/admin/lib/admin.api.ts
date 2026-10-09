import baseApi from "./apis/base.api";
import serverApi from "./apis/server-auth-api";
import type {
  AdminOrganization,
  AdminUser,
  ApiResponseData,
  DashboardStats,
  Membership,
  OrganizationListQuery,
  OrganizationReportRef,
  OrgStatus,
  OwnershipDisputeListQuery,
  OwnershipDisputeRef,
  Paginated,
  PlatformRole,
  ReportListQuery,
  UserListQuery,
  OrganizationPricingSetting,
  OrganizationPricingEligibility,
  AdminBankAccount,
  OrganizationCommissionSetting,
  VerificationQueueItem,
  VerificationQueueQuery,
} from "./types";

export interface UserDetail {
  user: AdminUser;
  memberships: Membership[];
}

function cleanParams(query: Record<string, unknown>): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value as string | number;
    }
  }
  return cleaned;
}

// ---- Client (browser) helpers ----

export async function fetchCurrentUser(): Promise<AdminUser> {
  const response = await baseApi.get<ApiResponseData<AdminUser>>("/users/me");
  return response.data.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await baseApi.get<ApiResponseData<DashboardStats>>("/admin/dashboard/stats");
  return response.data.data;
}

export async function fetchUsers(query: UserListQuery = {}): Promise<Paginated<AdminUser>> {
  const response = await baseApi.get<ApiResponseData<Paginated<AdminUser>>>("/admin/users", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function fetchUserDetail(id: string): Promise<UserDetail> {
  const response = await baseApi.get<ApiResponseData<UserDetail>>(`/admin/users/${id}`);
  return response.data.data;
}

export async function updateUserRole(id: string, role: PlatformRole): Promise<void> {
  await baseApi.patch(`/admin/users/${id}/role`, { role });
}

export async function fetchOrganizations(query: OrganizationListQuery = {}): Promise<Paginated<AdminOrganization>> {
  const response = await baseApi.get<ApiResponseData<Paginated<AdminOrganization>>>("/admin/organizations", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function fetchOrganizationDetail(id: string): Promise<AdminOrganization> {
  const response = await baseApi.get<ApiResponseData<AdminOrganization>>(`/admin/organizations/${id}`);
  return response.data.data;
}

export async function updateOrganizationStatus(id: string, status: OrgStatus): Promise<void> {
  await baseApi.patch(`/admin/organizations/${id}/status`, { status });
}

export async function fetchVerificationQueue(
  query: VerificationQueueQuery = {},
): Promise<Paginated<VerificationQueueItem>> {
  const response = await baseApi.get<ApiResponseData<Paginated<VerificationQueueItem>>>("/admin/verifications", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function fetchReports(query: ReportListQuery = {}): Promise<Paginated<OrganizationReportRef>> {
  const response = await baseApi.get<ApiResponseData<Paginated<OrganizationReportRef>>>("/admin/reports", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function fetchReportDetail(id: string): Promise<OrganizationReportRef> {
  const response = await baseApi.get<ApiResponseData<OrganizationReportRef>>(`/admin/reports/${id}`);
  return response.data.data;
}

export async function updateReportStatus(id: string, status: "open" | "investigating"): Promise<void> {
  await baseApi.patch(`/admin/reports/${id}/status`, { status });
}

export async function resolveReport(id: string, resolution: string): Promise<void> {
  await baseApi.patch(`/admin/reports/${id}/resolve`, { resolution });
}

export async function rejectReport(id: string, reason: string): Promise<void> {
  await baseApi.patch(`/admin/reports/${id}/reject`, { reason });
}

export async function fetchOwnershipDisputes(
  query: OwnershipDisputeListQuery = {},
): Promise<Paginated<OwnershipDisputeRef>> {
  const response = await baseApi.get<ApiResponseData<Paginated<OwnershipDisputeRef>>>("/admin/ownership-disputes", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function fetchOwnershipDisputeDetail(id: string): Promise<OwnershipDisputeRef> {
  const response = await baseApi.get<ApiResponseData<OwnershipDisputeRef>>(`/admin/ownership-disputes/${id}`);
  return response.data.data;
}

export async function updateDisputeStatus(id: string, status: "open" | "investigating"): Promise<void> {
  await baseApi.patch(`/admin/ownership-disputes/${id}/status`, { status });
}

export async function setDisputeFrozen(id: string, frozen: boolean): Promise<void> {
  await baseApi.patch(`/admin/ownership-disputes/${id}/freeze`, { frozen });
}

export async function resolveDispute(id: string, resolution: string, toUserId?: number): Promise<void> {
  await baseApi.patch(`/admin/ownership-disputes/${id}/resolve`, { resolution, toUserId });
}

export async function rejectDispute(id: string, reason: string): Promise<void> {
  await baseApi.patch(`/admin/ownership-disputes/${id}/reject`, { reason });
}

// ---- Server helpers (Server Components / Actions) ----

export async function serverFetchDashboardStats(): Promise<DashboardStats> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<DashboardStats>>("/admin/dashboard/stats");
  return response.data.data;
}

export async function serverFetchUsers(query: UserListQuery = {}): Promise<Paginated<AdminUser>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<AdminUser>>>("/admin/users", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchUserDetail(id: string): Promise<UserDetail> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<UserDetail>>(`/admin/users/${id}`);
  return response.data.data;
}

export async function serverFetchOrganizations(
  query: OrganizationListQuery = {},
): Promise<Paginated<AdminOrganization>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<AdminOrganization>>>("/admin/organizations", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchOrganizationDetail(id: string): Promise<AdminOrganization> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<AdminOrganization>>(`/admin/organizations/${id}`);
  return response.data.data;
}

export async function serverFetchOrganizationPricing(
  id: string,
): Promise<{ setting: OrganizationPricingSetting; eligibility: OrganizationPricingEligibility }> {
  const api = await serverApi();
  const response = await api.get<
    ApiResponseData<{ setting: OrganizationPricingSetting; eligibility: OrganizationPricingEligibility }>
  >(`/admin/organizations/${id}/pricing`);
  return response.data.data;
}

export async function serverFetchOrganizationBankAccount(id: string): Promise<AdminBankAccount | null> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<AdminBankAccount | null>>(`/admin/organizations/${id}/bank-account`);
  return response.data.data;
}

export async function serverFetchOrganizationCommission(id: string): Promise<OrganizationCommissionSetting | null> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<OrganizationCommissionSetting>>(
    `/admin/organizations/${id}/commission`,
  );
  return response.data.data;
}

export async function serverFetchVerificationQueue(
  query: VerificationQueueQuery = {},
): Promise<Paginated<VerificationQueueItem>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<VerificationQueueItem>>>("/admin/verifications", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchReports(query: ReportListQuery = {}): Promise<Paginated<OrganizationReportRef>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<OrganizationReportRef>>>("/admin/reports", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchReportDetail(id: string): Promise<OrganizationReportRef> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<OrganizationReportRef>>(`/admin/reports/${id}`);
  return response.data.data;
}

export async function serverFetchOwnershipDisputes(
  query: OwnershipDisputeListQuery = {},
): Promise<Paginated<OwnershipDisputeRef>> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<Paginated<OwnershipDisputeRef>>>("/admin/ownership-disputes", {
    params: cleanParams(query),
  });
  return response.data.data;
}

export async function serverFetchOwnershipDisputeDetail(id: string): Promise<OwnershipDisputeRef> {
  const api = await serverApi();
  const response = await api.get<ApiResponseData<OwnershipDisputeRef>>(`/admin/ownership-disputes/${id}`);
  return response.data.data;
}
