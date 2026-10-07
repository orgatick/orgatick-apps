"use client";

import { IconUsersGroup } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationMemberResponse, OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { handleApiError } from "@/lib/apis/api-error";
import { removeMember } from "@/lib/apis/organization.api";
import { InviteMemberDialog } from "./invite-member-dialog";
import { MemberRow, STATUS_LABELS } from "./member-row";

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "All statuses",
  ...STATUS_LABELS,
};

interface TeamMembersCardProps {
  members: OrganizationMemberResponse[];
  roles: OrganizationRoleOptionResponse[];
  canInvite: boolean;
  canUpdate: boolean;
  canRemove: boolean;
}

export function TeamMembersCard({ members, roles, canInvite, canUpdate, canRemove }: TeamMembersCardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const roleItems = Object.fromEntries(roles.map((role) => [role.key, role.name]));

  const runAction = async (key: string, action: () => Promise<unknown>, successMessage: string) => {
    setPendingAction(key);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(handleApiError(error, "Operation failed"));
    } finally {
      setPendingAction(null);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      search.trim().length === 0 ||
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        {canInvite && (
          <CardAction>
            <InviteMemberDialog roles={roles} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select
            items={STATUS_FILTER_ITEMS}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTER_ITEMS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredMembers.length === 0 ? (
          <Empty className="py-8">
            <EmptyMedia>
              <IconUsersGroup className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No team members found</EmptyTitle>
              <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                roles={roles}
                roleItems={roleItems}
                canUpdate={canUpdate}
                canRemove={canRemove}
                isBusy={pendingAction !== null}
                onRemove={() => runAction(`remove:${member.id}`, () => removeMember(member.id), "Member removed")}
                runAction={runAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
