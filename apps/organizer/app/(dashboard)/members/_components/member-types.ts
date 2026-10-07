import type {
  OrganizationInvitationResponse,
  OrganizationMemberResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";

export type MemberStatusValue = "active" | "inactive";

export interface MemberActionOptions {
  onSuccess?: () => void;
}

export interface MembersStateProps {
  members: OrganizationMemberResponse[];
  roles: OrganizationRoleOptionResponse[];
  invitations: OrganizationInvitationResponse[];
  canInvite: boolean;
  canUpdate: boolean;
  canRemove: boolean;
}
