import type {
  AddOrganizationMember,
  CreateOrganizationInvitation,
  EffectivePermissionsResponse,
  InvitationStatusFilter,
  OrganizationInvitationResponse,
  OrganizationMemberResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
import api from "./auth.api";

const TEAM_BASE = "/organizations/current";

export const TEAM_PERMISSIONS = {
  view: "organization:member:view",
  invite: "organization:member:invite",
  update: "organization:member:update",
  remove: "organization:member:remove",
} as const;

export type MemberStatusValue = "active" | "inactive";

async function unwrap<T>(request: Promise<{ data: { data?: T } }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

export async function fetchTeamMembers(): Promise<OrganizationMemberResponse[]> {
  return await unwrap<OrganizationMemberResponse[]>(api.get(`${TEAM_BASE}/members`));
}

export async function addDirectMember(input: AddOrganizationMember): Promise<OrganizationMemberResponse> {
  return await unwrap<OrganizationMemberResponse>(api.post(`${TEAM_BASE}/members`, input));
}

export async function fetchTeamRoles(): Promise<OrganizationRoleOptionResponse[]> {
  return await unwrap<OrganizationRoleOptionResponse[]>(api.get(`${TEAM_BASE}/roles`));
}

export async function fetchEffectivePermissions(): Promise<EffectivePermissionsResponse> {
  return await unwrap<EffectivePermissionsResponse>(api.get(`${TEAM_BASE}/permissions`));
}

export async function updateMemberRole(memberId: string, role: string): Promise<OrganizationMemberResponse> {
  return await unwrap<OrganizationMemberResponse>(api.patch(`${TEAM_BASE}/members/${memberId}/role`, { role }));
}

export async function updateMemberStatus(
  memberId: string,
  status: MemberStatusValue,
): Promise<OrganizationMemberResponse> {
  return await unwrap<OrganizationMemberResponse>(api.patch(`${TEAM_BASE}/members/${memberId}/status`, { status }));
}

export async function removeMember(memberId: string): Promise<unknown> {
  return await unwrap<unknown>(api.delete(`${TEAM_BASE}/members/${memberId}`));
}

export async function fetchTeamInvitations(status?: InvitationStatusFilter): Promise<OrganizationInvitationResponse[]> {
  return await unwrap<OrganizationInvitationResponse[]>(
    api.get(`${TEAM_BASE}/invitations`, { params: status ? { status } : undefined }),
  );
}

export async function createTeamInvitation(
  input: CreateOrganizationInvitation,
): Promise<OrganizationInvitationResponse> {
  return await unwrap<OrganizationInvitationResponse>(api.post(`${TEAM_BASE}/invitations`, input));
}

export async function resendTeamInvitation(invitationId: string): Promise<OrganizationInvitationResponse> {
  return await unwrap<OrganizationInvitationResponse>(api.post(`${TEAM_BASE}/invitations/${invitationId}/resend`));
}

export async function cancelTeamInvitation(invitationId: string): Promise<OrganizationInvitationResponse> {
  return await unwrap<OrganizationInvitationResponse>(api.delete(`${TEAM_BASE}/invitations/${invitationId}`));
}

export async function updateCurrentOrganization(
  organizationId: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  return await unwrap<unknown>(api.patch(`/organizations/${organizationId}`, data));
}

export async function switchOrganization(organizationId: string | number): Promise<{ id: string; name: string }> {
  return await unwrap<{ id: string; name: string }>(
    api.post("/session/organization", { organizationId: String(organizationId) }),
  );
}
