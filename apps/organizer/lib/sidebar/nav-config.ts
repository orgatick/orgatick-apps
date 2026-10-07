import type { Icon } from "@tabler/icons-react";
import type {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationStatus,
  OrganizationVerificationStatus,
} from "@orgatick/contracts";
import { IconLayoutDashboard, IconPlus, IconSettings, IconShieldCheck, IconUsersGroup } from "@tabler/icons-react";

export const NAV_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface SidebarOrgRole {
  id: string | number;
  key: OrganizationMemberRole | (string & {});
  name: string;
}

interface SidebarOrgRef {
  id: string | number;
  name: string;
  slug?: string;
}

interface SidebarOrgStats {
  totalEvents: number;
  totalParticipants: number;
  totalRevenue: string | number;
}

interface SidebarOrgVerification {
  status: OrganizationVerificationStatus | (string & {});
  rejectionReason?: string | null;
  verifiedAt?: string | null;
}

interface SidebarOrgAddress {
  addressLine1?: string | null;
  addressLine2?: string | null;
  landmark?: string | null;
  postalCode?: string | null;
  formattedAddress?: string | null;
}

interface SidebarOrgDetail extends SidebarOrgRef {
  logo?: string | null;
  status?: OrganizationStatus | (string & {});
  allowPaidEvents?: boolean;
  description?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: SidebarOrgRef | null;
  subCategory?: SidebarOrgRef | null;
  address?: SidebarOrgAddress | null;
  verification?: SidebarOrgVerification | null;
  stats?: SidebarOrgStats | null;
}

/** One entry of `GET /organizations/my` -> `data.items`. */
export interface SidebarOrganization {
  roleId: string | number;
  role: SidebarOrgRole;
  status: OrganizationMemberStatus | (string & {});
  joinedAt?: string;
  organization: SidebarOrgDetail;
}

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: Icon;
  badge?: string;
  exact?: boolean;
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    label: "Organization",
    items: [
      { href: "/", label: "Overview", icon: IconLayoutDashboard, exact: true },
      { href: "/members", label: "Members", icon: IconUsersGroup },
      { href: "/verification", label: "Verification", icon: IconShieldCheck },
      { href: "/settings", label: "Settings", icon: IconSettings },
    ],
  },
];

export const SIDEBAR_PRIMARY_ACTION: SidebarNavItem = {
  href: "/create",
  label: "New Organization",
  icon: IconPlus,
};
