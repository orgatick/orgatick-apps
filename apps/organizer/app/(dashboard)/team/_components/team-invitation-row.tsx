"use client";

import { IconRotateClockwise, IconX } from "@tabler/icons-react";
import type { InvitationStatusFilter, OrganizationInvitationResponse } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";

export const STATUS_BADGE_VARIANTS: Record<
  InvitationStatusFilter,
  "secondary" | "default" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "outline",
  cancelled: "outline",
};

export const STATUS_LABELS: Record<InvitationStatusFilter, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function statusOf(value: string): InvitationStatusFilter {
  return (value in STATUS_LABELS ? value : "pending") as InvitationStatusFilter;
}

interface TeamInvitationRowProps {
  invitation: OrganizationInvitationResponse;
  roleName: string;
  canInvite: boolean;
  canRemove: boolean;
  isBusy: boolean;
  onResend: () => void;
  onCancel: () => void;
}

export function TeamInvitationRow({
  invitation,
  roleName,
  canInvite,
  canRemove,
  isBusy,
  onResend,
  onCancel,
}: TeamInvitationRowProps) {
  const status = statusOf(invitation.status);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{invitation.email}</p>
        <p className="truncate text-xs text-muted-foreground">
          {roleName} · invited {formatDate(invitation.createdAt)}
          {invitation.invitedBy ? ` by ${invitation.invitedBy.name}` : ""}
          {status === "pending" ? ` · expires ${formatDate(invitation.expiresAt)}` : ""}
        </p>
      </div>

      <Badge variant={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>

      {status === "pending" && (
        <div className="flex items-center gap-2">
          {canInvite && (
            <Button variant="outline" size="sm" className="gap-1.5" disabled={isBusy} onClick={onResend}>
              <IconRotateClockwise className="size-3.5" />
              Resend
            </Button>
          )}
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:border-destructive/40 hover:text-destructive"
              disabled={isBusy}
              onClick={onCancel}
            >
              <IconX className="size-3.5" />
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
