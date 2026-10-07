"use client";

import { IconTrash, IconUsersGroup } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { OrganizationMemberResponse, OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@orgatick/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { handleApiError } from "@/lib/apis/api-error";
import {
  removeMember,
  updateMemberRole,
  updateMemberStatus,
  type MemberStatusValue,
} from "@/lib/apis/organization.api";
import { InviteMemberDialog } from "./invite-member-dialog";

type RunAction = (key: string, action: () => Promise<unknown>, successMessage: string) => Promise<void>;

const STATUS_LABELS: Record<MemberStatusValue, string> = {
  active: "Active",
  inactive: "Inactive",
};

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "All statuses",
  ...STATUS_LABELS,
};

function initialsOf(name: string): string {
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

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface RemoveMemberButtonProps {
  member: OrganizationMemberResponse;
  disabled: boolean;
  onConfirm: () => Promise<void>;
}

function RemoveMemberButton({ member, disabled, onConfirm }: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive hover:border-destructive/40 hover:text-destructive"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <IconTrash className="size-3.5" />
        Remove
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {member.user.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose access to this organization. You can invite them again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              setOpen(false);
            }}
          >
            Remove member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface MemberRowProps {
  member: OrganizationMemberResponse;
  roles: OrganizationRoleOptionResponse[];
  roleItems: Record<string, string>;
  canUpdate: boolean;
  canRemove: boolean;
  isBusy: boolean;
  runAction: RunAction;
}

function MemberRow({ member, roles, roleItems, canUpdate, canRemove, isBusy, runAction }: MemberRowProps) {
  const roleName = roles.find((role) => role.key === member.role.key)?.name ?? member.role.name;
  const status = (member.status === "inactive" ? "inactive" : "active") as MemberStatusValue;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
      <Avatar className="size-8 shrink-0">
        {member.user.avatar ? (
          <AvatarImage src={member.user.avatar} alt={member.user.name} />
        ) : (
          <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
            {initialsOf(member.user.name)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{member.user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {member.user.email} · joined {formatDate(member.joinedAt ?? member.createdAt)}
        </p>
      </div>

      {canUpdate ? (
        <Select
          items={roleItems}
          value={member.role.key}
          disabled={isBusy}
          onValueChange={(next) => {
            if (next && next !== member.role.key) {
              void runAction(`role:${member.id}`, () => updateMemberRole(member.id, next), "Member role updated");
            }
          }}
        >
          <SelectTrigger size="sm" className="w-32 text-xs" aria-label={`Role for ${member.user.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.key}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {roleName}
        </span>
      )}

      {canUpdate ? (
        <Select
          items={STATUS_LABELS}
          value={status}
          disabled={isBusy}
          onValueChange={(next) => {
            if (next && next !== status) {
              void runAction(
                `status:${member.id}`,
                () => updateMemberStatus(member.id, next as MemberStatusValue),
                next === "inactive" ? "Member suspended" : "Member restored",
              );
            }
          }}
        >
          <SelectTrigger size="sm" className="w-28 text-xs" aria-label={`Status for ${member.user.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Badge variant={status === "active" ? "secondary" : "outline"}>{STATUS_LABELS[status]}</Badge>
      )}

      {canRemove && (
        <RemoveMemberButton
          member={member}
          disabled={isBusy}
          onConfirm={() => runAction(`remove:${member.id}`, () => removeMember(member.id), "Member removed")}
        />
      )}
    </div>
  );
}

interface TeamMembersCardProps {
  members: OrganizationMemberResponse[];
  roles: OrganizationRoleOptionResponse[];
  canInvite: boolean;
  canUpdate: boolean;
  canRemove: boolean;
}

export function TeamMembersCard({ members, roles, canInvite, canUpdate, canRemove }: TeamMembersCardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runAction: RunAction = async (key, action, successMessage) => {
    setPendingKey(key);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      handleApiError(error, "Couldn't update the team. Please try again.");
    } finally {
      setPendingKey(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const roleItems = Object.fromEntries(roles.map((role) => [role.key, role.name]));
  const filtered = members.filter((member) => {
    const matchesQuery =
      normalizedQuery === "" ||
      member.user.name.toLowerCase().includes(normalizedQuery) ||
      member.user.email.toLowerCase().includes(normalizedQuery);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
        {canInvite && (
          <CardAction>
            <InviteMemberDialog roles={roles} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search members"
            className="h-8 max-w-56 flex-1"
          />
          <Select
            items={STATUS_FILTER_ITEMS}
            value={statusFilter}
            onValueChange={(next) => {
              if (next !== null) setStatusFilter(next);
            }}
          >
            <SelectTrigger size="sm" className="w-32 text-xs" aria-label="Filter members by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Empty className="border border-border/60">
            <EmptyMedia variant="icon">
              <IconUsersGroup />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{members.length === 0 ? "No members yet" : "No members match your search"}</EmptyTitle>
              <EmptyDescription>
                {members.length === 0
                  ? "Invite a teammate to start collaborating on events."
                  : "Try a different search term or clear the status filter."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-1">
            {filtered.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                roles={roles}
                roleItems={roleItems}
                canUpdate={canUpdate}
                canRemove={canRemove}
                isBusy={pendingKey !== null}
                runAction={runAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
