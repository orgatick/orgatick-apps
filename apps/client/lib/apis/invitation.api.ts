import type {
  ApiResponse,
  OrganizationInvitationPreviewResponse,
  OrganizationMemberResponse,
} from "@orgatick/contracts";
import api from "./auth.api";

type InvitationPreviewData = OrganizationInvitationPreviewResponse["data"];

/** Public preview of an invitation, fetched straight from the link in the email. */
export async function fetchInvitationPreview(token: string): Promise<InvitationPreviewData> {
  const response = await api.get<OrganizationInvitationPreviewResponse>(
    `/organizations/invitations/${encodeURIComponent(token)}`,
  );
  return response.data.data;
}

/** Accepts the invitation for the signed-in user. The server matches the email address. */
export async function acceptInvitation(token: string): Promise<OrganizationMemberResponse> {
  const response = await api.post<ApiResponse<OrganizationMemberResponse>>(
    `/organizations/invitations/${encodeURIComponent(token)}/accept`,
  );
  return response.data.data;
}

/** Declines the invitation for the signed-in user. */
export async function declineInvitation(token: string): Promise<void> {
  await api.post(`/organizations/invitations/${encodeURIComponent(token)}/reject`);
}
