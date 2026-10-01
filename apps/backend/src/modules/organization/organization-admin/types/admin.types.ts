export interface AdminActor {
  id: bigint;
  name: string;
}

export interface OrganizationHistories {
  status: import("../entities/organization-status-history.entity").OrganizationStatusHistory[];
  verification: import("../entities/organization-verification-log.entity").OrganizationVerificationLog[];
  ownership: import("../entities/organization-ownership-history.entity").OrganizationOwnershipHistory[];
}
