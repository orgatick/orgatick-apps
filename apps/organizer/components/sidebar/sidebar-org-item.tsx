"use client";

import { cn } from "@orgatick/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { DropdownMenuItem } from "@orgatick/ui/components/dropdown-menu";
import { IconCheck } from "@tabler/icons-react";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import {
  DOT_TONE,
  StatusChip,
  formatCount,
  membershipTone,
  orgInitials,
  verificationTone,
} from "./sidebar-org-switcher.helpers";

interface SidebarOrgItemProps {
  entry: SidebarOrganization;
  isActive: boolean;
  onSelect: () => void;
}

export function SidebarOrgItem({ entry, isActive, onSelect }: SidebarOrgItemProps) {
  const org = entry.organization;
  const orgVerifyTone = verificationTone(org.verification?.status);
  const orgSubtitle = org.subCategory?.name ?? org.category?.name ?? null;

  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn("items-start gap-2.5 py-2 ps-2", isActive && "bg-primary/10 focus:bg-primary/10")}
    >
      <span className="relative mt-px shrink-0">
        <Avatar className="size-7 rounded-lg">
          {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
          <AvatarFallback className="rounded-lg bg-primary/15 text-[10px] font-bold text-primary">
            {orgInitials(org.name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -end-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-popover",
            DOT_TONE[membershipTone(entry.status)],
          )}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={cn("min-w-0 flex-1 truncate text-sm", isActive && "font-semibold")}>{org.name}</span>
          {isActive && <IconCheck className="size-4 shrink-0 text-primary" />}
        </span>

        {orgSubtitle && <span className="block truncate text-[11px] text-muted-foreground">{orgSubtitle}</span>}

        <span className="mt-1 flex flex-wrap items-center gap-1">
          <span className="rounded-md bg-secondary/15 px-1.5 py-px font-mono text-[9px] font-semibold uppercase leading-normal tracking-wider text-secondary">
            {entry.role.name}
          </span>
          {org.verification?.status && orgVerifyTone !== "success" && (
            <StatusChip tone={orgVerifyTone} label={org.verification.status} />
          )}
        </span>

        <span className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground/80">
          <span>{formatCount(org.stats?.totalEvents)} events</span>
          <span aria-hidden="true">·</span>
          <span>{formatCount(org.stats?.totalParticipants)} attendees</span>
        </span>
      </span>
    </DropdownMenuItem>
  );
}
