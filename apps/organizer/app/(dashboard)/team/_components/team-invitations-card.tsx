"use client";

import { IconMail, IconRotateClockwise, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  InvitationStatusFilter,
  OrganizationInvitationResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Skeleton } from "@orgatick/ui/components/skeleton";
import { handleApiError } from "@/lib/apis/api-error";
import { cancelTeamInvitation, fetchTeamInvitations, resendTeamInvitation } from "@/lib/apis/organization.api";

const STATUS_BADGE_VARIANTS: Record<InvitationStatusFilter, "secondary" | "default" | "destructive" | "outline"> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "outline",
  cancelled: "outline",
};

const STATUS_LABELS: Record<InvitationStatusFilter, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusOf(value: string): InvitationStatusFilter {
  return (value in STATUS_LABELS ? value : "pending") as InvitationStatusFilter;
}

interface TeamInvitationsCardProps {
  invitations: OrganizationInvitationResponse[];
  roles: OrganizationRoleOptionResponse[];
  canInvite: boolean;
  canRemove: boolean;
}

export function TeamInvitationsCard({ invitations, roles, canInvite, canRemove }: TeamInvitationsCardProps) {
  const [statusFilter, setStatusFilter] = useState<InvitationStatusFilter>("pending");
  const [items, setItems] = useState<OrganizationInvitationResponse[]>(invitations);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const reload = async (status: InvitationStatusFilter) => {
    setIsLoading(true);
    try {
      setItems(await fetchTeamInvitations(status));
    } catch (error) {
      handleApiError(error, "Couldn't load invitations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (next: string | null) => {
    if (!next) return;
    const status = statusOf(next);
    setStatusFilter(status);
    void reload(status);
  };

  const runAction = async (key: string, action: () => Promise<unknown>, successMessage: string) => {
    setPendingKey(key);
    try {
      await action();
      toast.success(successMessage);
      await reload(statusFilter);
    } catch (error) {
      handleApiError(error, "Couldn't update the invitation. Please try again.");
    } finally {
      setPendingKey(null);
    }
  };

  const roleNameOf = (invitation: OrganizationInvitationResponse) =>
    roles.find((role) => role.key === invitation.role)?.name ?? invitation.role;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invitations</CardTitle>
        <div className="flex items-center gap-2">
          <Select items={STATUS_LABELS} value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger size="sm" className="w-32 text-xs" aria-label="Filter invitations by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as InvitationStatusFilter[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <Empty className="border border-border/60">
            <EmptyMedia variant="icon">
              <IconMail />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>
                {statusFilter === "pending" ? "No pending invitations" : `No ${statusFilter} invitations`}
              </EmptyTitle>
              <EmptyDescription>
                {statusFilter === "pending"
                  ? "Invite a teammate from the members card above and their invitation will show up here."
                  : "Switch the status filter to see other invitations."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-1">
            {items.map((invitation) => {
              const status = statusOf(invitation.status);
              const isBusy = pendingKey !== null;
              return (
                <div
                  key={invitation.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{invitation.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {roleNameOf(invitation)} · invited {formatDate(invitation.createdAt)}
                      {invitation.invitedBy ? ` by ${invitation.invitedBy.name}` : ""}
                      {status === "pending" ? ` · expires ${formatDate(invitation.expiresAt)}` : ""}
                    </p>
                  </div>

                  <Badge variant={STATUS_BADGE_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>

                  {status === "pending" && (
                    <div className="flex items-center gap-2">
                      {canInvite && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isBusy}
                          onClick={() =>
                            void runAction(
                              `resend:${invitation.id}`,
                              () => resendTeamInvitation(invitation.id),
                              `Invitation resent to ${invitation.email}`,
                            )
                          }
                        >
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
                          onClick={() =>
                            void runAction(
                              `cancel:${invitation.id}`,
                              () => cancelTeamInvitation(invitation.id),
                              "Invitation cancelled",
                            )
                          }
                        >
                          <IconX className="size-3.5" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
