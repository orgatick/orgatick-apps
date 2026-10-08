"use client";

import { cn } from "@orgatick/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { DropdownMenuItem } from "@orgatick/ui/components/dropdown-menu";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import {
  DOT_TONE,
  StatusChip,
  formatCount,
  membershipTone,
  orgInitials,
  verificationTone,
} from "./sidebar-org-switcher.helpers";
import { Badge } from "@orgatick/ui/components/badge";

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
      className={cn("items-start gap-2.5 py-2 ps-2", isActive && "bg-primary/5 border focus:bg-primary/10")}
    >
      <span className="relative mt-px shrink-0">
        <Avatar className="size-10 rounded-lg">
          {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
          <AvatarFallback className="rounded-lg bg-primary/15 text-lg font-bold text-primary">
            {orgInitials(org.name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 border-popover",
            DOT_TONE[membershipTone(entry.status)],
          )}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={cn("min-w-0 flex-1 truncate text-base", isActive && "font-semibold")}>{org.name}</span>
          <Badge className="rounded-md bg-secondary/15 px-1.5 text-xs font-semibold uppercase leading-normal tracking-wider text-secondary">
            {entry.role.name}
          </Badge>
          {/*{isActive && <IconCheck className="size-4 shrink-0 text-primary" />}*/}
        </span>

        {orgSubtitle && <span className="block truncate text-xs tracking-wide">{orgSubtitle}</span>}

        <span className="mt-1 flex flex-wrap items-center gap-1">
          {org.verification?.status && orgVerifyTone !== "success" && (
            <StatusChip tone={orgVerifyTone} label={org.verification.status} />
          )}
        </span>

        <span className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span>{formatCount(org.stats?.totalEvents)} events</span>
          <span aria-hidden="true">·</span>
          <span>{formatCount(org.stats?.totalParticipants)} attendees</span>
        </span>
      </span>
    </DropdownMenuItem>
  );
}
