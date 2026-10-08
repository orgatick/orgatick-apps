"use client";

import { IconMailPlus, IconUserPlus } from "@tabler/icons-react";
import type { OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { AddMemberDialog } from "./add-member-dialog";

interface MembersHeaderProps {
  organizationName: string;
  roles: OrganizationRoleOptionResponse[];
  canInvite?: boolean;
}

export function MembersHeader({ organizationName, roles, canInvite = true }: MembersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Organization
        </p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage teammates, role assignments, and invitations for{" "}
          <span className="font-medium text-foreground">{organizationName}</span>.
        </p>
      </div>

      {canInvite && (
        <div className="flex flex-wrap items-center gap-2">
          <AddMemberDialog
            roles={roles}
            defaultMethod="direct"
            trigger={
              <Button size="sm" className="gap-1.5">
                <IconUserPlus className="size-4" />
                Add Member
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
