import type { InvitationStatusFilter } from "@orgatick/contracts";
import type { MemberStatusValue } from "./member-types";

export const STATUS_LABELS: Record<MemberStatusValue, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "All statuses",
  ...STATUS_LABELS,
};

export const INVITATION_STATUS_BADGE_VARIANTS: Record<
  InvitationStatusFilter,
  "secondary" | "default" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "outline",
  cancelled: "outline",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatusFilter, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function statusOfInvitation(value: string): InvitationStatusFilter {
  return (value in INVITATION_STATUS_LABELS ? value : "pending") as InvitationStatusFilter;
}
