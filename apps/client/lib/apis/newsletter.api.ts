import type {
  ApiResponse,
  ManageSubscriptionResponse,
  PublicNewsletterArchiveItem,
  PublicNewsletterCampaignResponse,
  SubscribeNewsletterResponse,
  UnsubscribeNewsletterResponse,
  UpdateNewsletterPreferencesDto,
} from "@orgatick/contracts";
import api from "./auth.api";

export interface PublicSubscribePayload {
  email: string;
  name?: string;
  list?: string;
  source?: "footer" | "landing_page" | "dashboard" | "checkout" | "import" | "api";
  preferences?: {
    categories?: string[];
    marketing?: boolean;
  };
  website?: string;
}

export type PublicSubscribeResult = SubscribeNewsletterResponse;

export async function subscribeNewsletter(payload: PublicSubscribePayload): Promise<PublicSubscribeResult> {
  const response = await api.post<ApiResponse<PublicSubscribeResult>>("/newsletter/subscribe", payload);
  return response.data.data;
}

export async function confirmNewsletterSubscription(token: string): Promise<PublicSubscribeResult> {
  const response = await api.get<ApiResponse<PublicSubscribeResult>>("/newsletter/confirm", {
    params: { token },
  });
  return response.data.data;
}

export async function unsubscribeNewsletter(token: string): Promise<UnsubscribeNewsletterResponse> {
  const response = await api.get<ApiResponse<UnsubscribeNewsletterResponse>>("/newsletter/unsubscribe", {
    params: { token },
  });
  return response.data.data;
}

export async function fetchNewsletterPreferences(token: string): Promise<ManageSubscriptionResponse> {
  const response = await api.get<ApiResponse<ManageSubscriptionResponse>>("/newsletter/preferences", {
    params: { token },
  });
  return response.data.data;
}

export async function updateNewsletterPreferences(
  token: string,
  payload: UpdateNewsletterPreferencesDto,
): Promise<ManageSubscriptionResponse> {
  const response = await api.post<ApiResponse<ManageSubscriptionResponse>>("/newsletter/preferences", payload, {
    params: { token },
  });
  return response.data.data;
}

export async function resubscribeNewsletter(token: string): Promise<SubscribeNewsletterResponse> {
  const response = await api.post<ApiResponse<SubscribeNewsletterResponse>>(
    "/newsletter/resubscribe",
    {},
    { params: { token } },
  );
  return response.data.data;
}

export async function fetchPublicCampaign(uuid: string): Promise<PublicNewsletterCampaignResponse> {
  const response = await api.get<ApiResponse<PublicNewsletterCampaignResponse>>(`/newsletter/campaigns/${uuid}`);
  return response.data.data;
}

export async function fetchPublicCampaigns(): Promise<PublicNewsletterArchiveItem[]> {
  const response = await api.get<ApiResponse<PublicNewsletterArchiveItem[]>>("/newsletter/campaigns");
  return response.data.data;
}

export async function fetchNewsletterSubscription(): Promise<boolean> {
  try {
    const response = await api.get<ApiResponse<{ isSubscribed: boolean }>>("/newsletter/is-subscribed");
    return response.data.data.isSubscribed;
  } catch {
    return false;
  }
}
