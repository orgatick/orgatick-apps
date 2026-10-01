import type { AuthRequest } from "../../../../common/types/auth-request.types";

export interface OrganizationContext {
  organizationId: bigint;
  membershipId: bigint;
  roleId: bigint;
}

export interface CachedOrganizationMembership {
  membershipId: string;
  organizationId: string;
  roleId: string;
}

export interface OrganizationScopedRequest extends AuthRequest {
  organizationContext?: OrganizationContext;
}
