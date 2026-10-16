"use client";

import { IconMail, IconShield, IconUsers } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import type { MembersStateProps } from "./member-types";
import { InvitationsListCard } from "./invitations-list-card";
import { MembersListCard } from "./members-list-card";
import { RolesListCard } from "./roles-list-card";

export function MembersContainer({ members, roles, invitations, canInvite, canUpdate, canRemove }: MembersStateProps) {
  const pendingInvitesCount = invitations.filter((inv) => inv.status === "pending").length;

  return (
    <Tabs defaultValue="members" className="w-full gap-5 flex flex-col">
      {/* Shadcn Tabs Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <TabsList className="h-9 p-1">
          <TabsTrigger value="members" className="gap-2 px-3 py-1 text-xs sm:text-sm">
            <IconUsers className="size-4" />
            <span>Members</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-muted-foreground/15 text-foreground/80">
              {members.length}
            </span>
          </TabsTrigger>

          <TabsTrigger value="invitations" className="gap-2 px-3 py-1 text-xs sm:text-sm">
            <IconMail className="size-4" />
            <span>Invitations</span>
            {pendingInvitesCount > 0 ? (
              <span className="rounded bg-primary/15 text-primary px-1.5 py-0.2 font-mono text-[11px] font-semibold">
                {pendingInvitesCount}
              </span>
            ) : (
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-muted-foreground/15 text-foreground/80">
                {invitations.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="roles" className="gap-2 px-3 py-1 text-xs sm:text-sm">
            <IconShield className="size-4" />
            <span>Roles &amp; Permissions</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-muted-foreground/15 text-foreground/80">
              {roles.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Full-width Tab Views */}
      <TabsContent value="members" className="outline-none overflow-x-scroll">
        <MembersListCard members={members} roles={roles} canUpdate={canUpdate} canRemove={canRemove} />
      </TabsContent>

      <TabsContent value="invitations" className="outline-none">
        <InvitationsListCard
          initialInvitations={invitations}
          roles={roles}
          canInvite={canInvite}
          canRemove={canRemove}
        />
      </TabsContent>

      <TabsContent value="roles" className="outline-none">
        <RolesListCard roles={roles} canUpdate={canUpdate} />
      </TabsContent>
    </Tabs>
  );
}
