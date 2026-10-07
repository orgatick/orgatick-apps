"use client";

import { Button } from "@orgatick/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Badge } from "@orgatick/ui/components/badge";
import type { AdminOrganization, MemberRef, MemberRoleKey, MemberStatus } from "@/lib/types";
import { changeMemberRole, changeMemberStatus, removeOrganizationMember } from "@/lib/org-admin.api";
import { dangerButton, useOrgAction } from "../../_components/use-org-action";

export const ROLES: MemberRoleKey[] = ["owner", "admin", "manager", "member"];
export const STATUSES: MemberStatus[] = ["active", "inactive"];

interface AdminMemberRowProps {
  organization: AdminOrganization;
  member: MemberRef;
}

export function AdminMemberRow({ organization, member }: AdminMemberRowProps) {
  const { pending, run } = useOrgAction({ successMessage: "Member updated" });
  const id = String(organization.id);
  const memberId = String(member.id);
  const initials = (member.user?.name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
      <Avatar className="size-8 shrink-0">
        {member.user?.avatar ? (
          <AvatarImage src={member.user.avatar} alt={member.user?.name ?? ""} />
        ) : (
          <AvatarFallback className="bg-primary/15 font-mono text-[9px] font-bold text-primary">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{member.user?.name ?? "Unknown user"}</p>
        <p className="truncate text-xs text-muted-foreground">
          #{member.user?.id ?? "-"} · {new Date(member.joinedAt).toLocaleDateString()}
        </p>
      </div>
      <Badge variant="secondary">{member.role?.key ?? "member"}</Badge>
      <Select
        value={member.status}
        disabled={pending}
        onValueChange={(status) => run(() => changeMemberStatus(id, memberId, status as MemberStatus))}
      >
        <SelectTrigger className="h-7 w-28 font-mono text-xs capitalize" aria-label="Member status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="font-mono text-xs capitalize">
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={member.role?.key}
        disabled={pending}
        onValueChange={(role) => run(() => changeMemberRole(id, memberId, role as MemberRoleKey))}
      >
        <SelectTrigger className="h-7 w-28 font-mono text-xs capitalize" aria-label="Member role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role} className="font-mono text-xs capitalize">
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        className={dangerButton}
        disabled={pending}
        onClick={() => run(() => removeOrganizationMember(id, memberId))}
      >
        Remove
      </Button>
    </div>
  );
}
