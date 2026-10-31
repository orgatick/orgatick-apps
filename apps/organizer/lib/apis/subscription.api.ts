import baseApi from "./base.api";
import serverApi from "./server-auth-api";
import type { OrganizationEffectiveEntitlements, ProrationPreview } from "@orgatick/contracts";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface OrganizerSubscriptionPrice {
  id: string;
  billingInterval: "month" | "year" | "none";
  priceInMinorUnits: string;
  currency: string;
}

export interface OrganizerPlanFeature {
  id: string;
  isIncluded: boolean;
  featureLevel?: string | null;
  feature: {
    code: string;
    name: string;
    category: string;
  };
}

export interface OrganizerPlanLimit {
  id: string;
  isUnlimited: boolean;
  limitValue?: string | null;
  limitDefinition: {
    code: string;
    name: string;
    limitScope: string;
    unit: string;
  };
}

export interface OrganizerSubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  tierLevel: number;
  isActive: boolean;
  isPublic: boolean;
  prices?: OrganizerSubscriptionPrice[];
  features?: OrganizerPlanFeature[];
  limits?: OrganizerPlanLimit[];
}

export interface ActiveSubscriptionDetail {
  id: string;
  organizationId: string;
  planId: string;
  status: string;
  billingInterval: string;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  autoRenew: boolean;
  plan: OrganizerSubscriptionPlan;
  price?: OrganizerSubscriptionPrice | null;
  pendingPlan?: OrganizerSubscriptionPlan | null;
  pendingChangeEffectiveAt?: string | null;
}

export interface SubscriptionInvoiceView {
  id: string;
  invoiceNumber: string;
  billingReason: string;
  status: string;
  currency: string;
  subtotalMinorUnits: string;
  taxAmountMinorUnits: string;
  prorationCreditMinorUnits: string;
  totalMinorUnits: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string | null;
  createdAt: string;
  items?: {
    id: string;
    description: string;
    itemType: string;
    subtotalMinorUnits: string;
    totalMinorUnits: string;
  }[];
}

// Server-side fetchers
export async function serverFetchCurrentSubscription(): Promise<ActiveSubscriptionDetail | null> {
  const api = await serverApi();
  const res = await api.get<ApiResponse<ActiveSubscriptionDetail>>("/organizations/current/subscription");
  return res.data.data;
}

export async function serverFetchEffectiveEntitlements(): Promise<OrganizationEffectiveEntitlements | null> {
  const api = await serverApi();
  const res = await api.get<ApiResponse<OrganizationEffectiveEntitlements>>(
    "/organizations/current/subscription/entitlements",
  );
  return res.data.data;
}

export async function serverFetchSubscriptionPlans(): Promise<OrganizerSubscriptionPlan[]> {
  const api = await serverApi();
  const res = await api.get<ApiResponse<OrganizerSubscriptionPlan[]>>("/organizations/current/subscription/plans");
  return res.data.data;
}

export async function serverFetchInvoices(): Promise<SubscriptionInvoiceView[]> {
  const api = await serverApi();
  const res = await api.get<ApiResponse<SubscriptionInvoiceView[]>>("/organizations/current/subscription/invoices");
  return res.data.data;
}

// Client-side actions
export async function previewUpgrade(targetPlanId: string, targetPriceId: string): Promise<ProrationPreview> {
  const res = await baseApi.get<ApiResponse<ProrationPreview>>("/organizations/current/subscription/upgrade-preview", {
    params: { targetPlanId, targetPriceId },
  });
  return res.data.data;
}

export async function executeUpgrade(
  targetPlanId: string,
  targetPriceId: string,
  preserveCycle = true,
): Promise<ActiveSubscriptionDetail> {
  const res = await baseApi.post<ApiResponse<ActiveSubscriptionDetail>>("/organizations/current/subscription/upgrade", {
    targetPlanId,
    targetPriceId,
    preserveCycle,
  });
  return res.data.data;
}

export async function scheduleDowngrade(
  targetPlanId: string,
  targetPriceId?: string,
): Promise<ActiveSubscriptionDetail> {
  const res = await baseApi.post<ApiResponse<ActiveSubscriptionDetail>>(
    "/organizations/current/subscription/downgrade",
    {
      targetPlanId,
      targetPriceId,
    },
  );
  return res.data.data;
}

export async function cancelSubscription(reason?: string): Promise<ActiveSubscriptionDetail> {
  const res = await baseApi.post<ApiResponse<ActiveSubscriptionDetail>>("/organizations/current/subscription/cancel", {
    reason,
  });
  return res.data.data;
}
