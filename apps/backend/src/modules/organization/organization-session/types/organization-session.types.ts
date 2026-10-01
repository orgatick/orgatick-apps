import type { OrganizationMember } from "../../organization-member";

export interface OrganizationSessionSummary {
  id: string;
  name: string;
}

export interface OrganizationListResponse {
  organizations: OrganizationMember[];
  currentOrganizationId: string | null;
}
