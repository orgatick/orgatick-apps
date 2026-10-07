"use client";

import { IconUserPlus, IconUsers, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { OrganizationMemberResponse, OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { handleApiError } from "@/lib/apis/api-error";
import { removeMember } from "@/lib/apis/organization.api";
import { AddMemberDialog } from "./add-member-dialog";
import { STATUS_FILTER_ITEMS } from "./member-helpers";
import { MemberRow } from "./member-row";

interface MembersListCardProps {
  members: OrganizationMemberResponse[];
  roles: OrganizationRoleOptionResponse[];
  canUpdate: boolean;
  canRemove: boolean;
}

export function MembersListCard({ members, roles, canUpdate, canRemove }: MembersListCardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const roleItems = useMemo(() => Object.fromEntries(roles.map((r) => [r.key, r.name])), [roles]);

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

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 || member.user.name.toLowerCase().includes(q) || member.user.email.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" || member.role.key === roleFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const hasFilters = search.trim().length > 0 || roleFilter !== "all" || statusFilter !== "all";

  return (
    <Card className="w-full border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">
              Organization Members{" "}
              <span className="text-xs font-normal text-muted-foreground">({filteredMembers.length})</span>
            </CardTitle>
            <AddMemberDialog
              roles={roles}
              defaultMethod="direct"
              trigger={
                <Button size="xs" variant="outline" className="gap-1 text-xs h-7">
                  <IconUserPlus className="size-3" />
                  Add Member
                </Button>
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 text-xs"
            />

            <Select
              items={{ all: "All Roles", ...roleItems }}
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val ?? "all")}
            >
              <SelectTrigger size="sm" className="w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.key}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              items={STATUS_FILTER_ITEMS}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val ?? "all")}
            >
              <SelectTrigger size="sm" className="w-28 text-xs">
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

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                <IconX className="size-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {filteredMembers.length === 0 ? (
          <Empty className="py-12 border border-border/40 my-3">
            <EmptyMedia variant="icon">
              <IconUsers className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{hasFilters ? "No matching members" : "No members found"}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try resetting your search query or status filters."
                  : "Add teammates to collaborate, manage events, and configure permissions."}
              </EmptyDescription>
            </EmptyHeader>
            {!hasFilters && (
              <div className="mt-4 flex items-center gap-2">
                <AddMemberDialog
                  roles={roles}
                  defaultMethod="direct"
                  trigger={
                    <Button size="sm" className="gap-1.5">
                      <IconUserPlus className="size-4" />
                      Add First Member
                    </Button>
                  }
                />
              </div>
            )}
          </Empty>
        ) : (
          <div className="divide-y divide-border/50">
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
