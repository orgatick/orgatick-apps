"use client";

import { IconRotateClockwise, IconX } from "@tabler/icons-react";
import type { OrganizationInvitationResponse } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import {
  formatDate,
  INVITATION_STATUS_BADGE_VARIANTS,
  INVITATION_STATUS_LABELS,
  statusOfInvitation,
} from "./member-helpers";

interface InvitationRowProps {
  invitation: OrganizationInvitationResponse;
  roleName: string;
  canInvite: boolean;
  canRemove: boolean;
  isBusy: boolean;
  onResend: () => void;
  onCancel: () => void;
}

export function InvitationRow({
  invitation,
  roleName,
  canInvite,
  canRemove,
  isBusy,
  onResend,
  onCancel,
}: InvitationRowProps) {
  const status = statusOfInvitation(invitation.status);

  const inviterName =
    (typeof invitation.invitedBy === "object" && invitation.invitedBy !== null ? invitation.invitedBy.name : null) ||
    (invitation as unknown as { inviter?: { name?: string } }).inviter?.name ||
    null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50 sm:flex-nowrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{invitation.email}</p>
          <Badge variant={INVITATION_STATUS_BADGE_VARIANTS[status]} className="text-[10px]">
            {INVITATION_STATUS_LABELS[status]}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {roleName} · invited {formatDate(invitation.createdAt)}
          {inviterName ? ` by ${inviterName}` : ""}
          {status === "pending" ? ` · expires ${formatDate(invitation.expiresAt)}` : ""}
        </p>
      </div>

      {status === "pending" && (
        <div className="flex shrink-0 items-center gap-2">
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
