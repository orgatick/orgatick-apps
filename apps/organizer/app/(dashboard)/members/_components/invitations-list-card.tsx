"use client";

import { IconMail, IconMailPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  InvitationStatusFilter,
  OrganizationInvitationResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Skeleton } from "@orgatick/ui/components/skeleton";
import { handleApiError } from "@/lib/apis/api-error";
import { cancelTeamInvitation, fetchTeamInvitations, resendTeamInvitation } from "@/lib/apis/organization.api";
import { AddMemberDialog } from "./add-member-dialog";
import { INVITATION_STATUS_LABELS, statusOfInvitation } from "./member-helpers";
import { InvitationRow } from "./invitation-row";

interface InvitationsListCardProps {
  initialInvitations: OrganizationInvitationResponse[];
  roles: OrganizationRoleOptionResponse[];
  canInvite?: boolean;
  canRemove: boolean;
}

export function InvitationsListCard({
  initialInvitations,
  roles,
  canInvite = true,
  canRemove,
}: InvitationsListCardProps) {
  const [statusFilter, setStatusFilter] = useState<InvitationStatusFilter>("pending");
  const [items, setItems] = useState<OrganizationInvitationResponse[]>(initialInvitations);
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
    const status = statusOfInvitation(next);
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
      toast.error(handleApiError(error, "Operation failed"));
    } finally {
      setPendingKey(null);
    }
  };

  const roleNameOf = (invitation: OrganizationInvitationResponse) =>
    roles.find((role) => role.key === invitation.role)?.name ?? invitation.role;

  return (
    <Card className="w-full border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">
              Sent Invitations <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
            </CardTitle>
            <AddMemberDialog
              roles={roles}
              defaultMethod="invite"
              trigger={
                <Button size="xs" variant="outline" className="gap-1 text-xs h-7">
                  <IconMailPlus className="size-3" />
                  Invite
                </Button>
              }
            />
          </div>

          <Select items={INVITATION_STATUS_LABELS} value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger size="sm" className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(INVITATION_STATUS_LABELS) as InvitationStatusFilter[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {INVITATION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <Empty className="py-12 border border-border/40 my-3">
            <EmptyMedia variant="icon">
              <IconMail className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>
                {statusFilter === "pending" ? "No pending invitations" : `No ${statusFilter} invitations`}
              </EmptyTitle>
              <EmptyDescription>
                {statusFilter === "pending"
                  ? "There are currently no outstanding invitations awaiting acceptance."
                  : `No invitations found with the "${statusFilter}" status.`}
              </EmptyDescription>
            </EmptyHeader>
            {statusFilter === "pending" && (
              <div className="mt-4">
                <AddMemberDialog
                  roles={roles}
                  defaultMethod="invite"
                  trigger={
                    <Button size="sm" className="gap-1.5">
                      <IconMailPlus className="size-4" />
                      Invite First Teammate
                    </Button>
                  }
                />
              </div>
            )}
          </Empty>
        ) : (
          <div className="divide-y divide-border/50">
            {items.map((invitation) => (
              <InvitationRow
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
