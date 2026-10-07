"use client";

import { IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  InvitationStatusFilter,
  OrganizationInvitationResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Skeleton } from "@orgatick/ui/components/skeleton";
import { handleApiError } from "@/lib/apis/api-error";
import { cancelTeamInvitation, fetchTeamInvitations, resendTeamInvitation } from "@/lib/apis/organization.api";
import { STATUS_LABELS, TeamInvitationRow, statusOf } from "./team-invitation-row";

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
            {items.map((invitation) => (
              <TeamInvitationRow
                key={invitation.id}
                invitation={invitation}
                roleName={roleNameOf(invitation)}
                canInvite={canInvite}
                canRemove={canRemove}
                isBusy={pendingKey !== null}
                onResend={() =>
                  void runAction(
                    `resend:${invitation.id}`,
                    () => resendTeamInvitation(invitation.id),
                    `Invitation resent to ${invitation.email}`,
                  )
                }
                onCancel={() =>
                  void runAction(
                    `cancel:${invitation.id}`,
                    () => cancelTeamInvitation(invitation.id),
                    "Invitation cancelled",
                  )
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
