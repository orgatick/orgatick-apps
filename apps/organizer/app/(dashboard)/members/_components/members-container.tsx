"use client";

import { useState } from "react";
import { IconMail, IconUsers } from "@tabler/icons-react";
import { cn } from "@orgatick/ui/lib/utils";

import type { MembersStateProps } from "./member-types";
import { InvitationsListCard } from "./invitations-list-card";
import { MembersListCard } from "./members-list-card";

export function MembersContainer({ members, roles, invitations, canInvite, canUpdate, canRemove }: MembersStateProps) {
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");

  const pendingInvitesCount = invitations.filter((inv) => inv.status === "pending").length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "members"
              ? "bg-muted text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <IconUsers className="size-4" />
          <span>Members</span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.2 font-mono text-[11px]",
              activeTab === "members"
                ? "bg-background text-foreground border border-border/60"
                : "bg-muted text-muted-foreground",
            )}
          >
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invitations")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "invitations"
              ? "bg-muted text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <IconMail className="size-4" />
          <span>Invitations</span>
          {pendingInvitesCount > 0 ? (
            <span className="rounded-md bg-primary/15 text-primary px-1.5 py-0.2 font-mono text-[11px] font-semibold">
              {pendingInvitesCount}
            </span>
          ) : (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.2 font-mono text-[11px]",
                activeTab === "invitations"
                  ? "bg-background text-foreground border border-border/60"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {invitations.length}
            </span>
          )}
        </button>
      </div>

      {/* Full-width Tab Views */}
      <div className="w-full">
        {activeTab === "members" ? (
          <MembersListCard members={members} roles={roles} canUpdate={canUpdate} canRemove={canRemove} />
        ) : (
          <InvitationsListCard
            initialInvitations={invitations}
            roles={roles}
            canInvite={canInvite}
            canRemove={canRemove}
          />
        )}
      </div>
    </div>
  );
}
