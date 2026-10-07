"use client";

import type { OrganizationMemberResponse, OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { updateMemberRole, updateMemberStatus, type MemberStatusValue } from "@/lib/apis/organization.api";
import { RemoveMemberDialog } from "./remove-member-dialog";

export const STATUS_LABELS: Record<MemberStatusValue, string> = {
  active: "Active",
  inactive: "Inactive",
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
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface MemberRowProps {
  member: OrganizationMemberResponse;
  roles: OrganizationRoleOptionResponse[];
  roleItems: Record<string, string>;
  canUpdate: boolean;
  canRemove: boolean;
  isBusy: boolean;
  onRemove: () => Promise<void>;
  runAction: (key: string, action: () => Promise<unknown>, successMessage: string) => Promise<void>;
}

export function MemberRow({
  member,
  roles,
  roleItems,
  canUpdate,
  canRemove,
  isBusy,
  onRemove,
  runAction,
}: MemberRowProps) {
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

      {canRemove && <RemoveMemberDialog member={member} disabled={isBusy} onConfirm={onRemove} />}
    </div>
  );
}
