"use client";

import { cn } from "@orgatick/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { IconBuildingCommunity, IconChevronDown, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import { StatusChip, orgInitials, verificationTone } from "./sidebar-org-switcher.helpers";
import { SidebarOrgItem } from "./sidebar-org-item";

interface SidebarOrgSwitcherProps {
  organizations: SidebarOrganization[];
  activeOrgId: string | number | null;
  onOrgChange: (id: string | number) => void;
  collapsed?: boolean;
  className?: string;
}

export function SidebarOrgSwitcher({
  organizations,
  activeOrgId,
  onOrgChange,
  collapsed = false,
  className,
}: SidebarOrgSwitcherProps) {
  const activeEntry = organizations.find((entry) => entry.organization.id === activeOrgId) ?? organizations[0] ?? null;
  const activeOrg = activeEntry?.organization ?? null;

  const category = activeOrg?.subCategory?.name ?? activeOrg?.category?.name ?? null;
  const verifyTone = verificationTone(activeOrg?.verification?.status);
  const verifyLabel = activeOrg?.verification?.status ?? "unverified";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "group h-auto w-full items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 px-2 py-2 text-start shadow-xs transition-colors hover:bg-accent/10 aria-expanded:bg-accent/10",
              collapsed && "justify-center px-0",
              className,
            )}
          />
        }
      >
        {activeOrg ? (
          <Avatar className="size-7 shrink-0 rounded-lg">
            {activeOrg.logo && <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />}
            <AvatarFallback className="rounded-lg bg-primary/15 text-xs font-bold text-primary">
              {orgInitials(activeOrg.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <IconBuildingCommunity className="size-4" />
          </span>
        )}

        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {activeOrg?.name ?? "No organization"}
              </span>
              {activeOrg && verifyTone !== "success" && <StatusChip tone={verifyTone} label={verifyLabel} />}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
              {activeEntry && <span className="shrink-0 font-medium text-foreground/80">{activeEntry.role.name}</span>}
              {activeEntry && category && <span className="truncate">· {category}</span>}
              {!activeEntry && <span className="truncate">Select an organization</span>}
            </span>
          </span>
        )}

        <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="w-72 p-1.5">
        <div className="px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Switch organization
        </div>
        <DropdownMenuSeparator />

        {organizations.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            You are not a member of any organization yet.
          </div>
        ) : (
          organizations.map((entry) => (
            <SidebarOrgItem
              key={entry.organization.id}
              entry={entry}
              isActive={entry.organization.id === activeOrg?.id}
              onSelect={() => onOrgChange(entry.organization.id)}
            />
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/create" />} className="gap-2.5 py-2 ps-2">
          <IconPlus className="size-4 text-muted-foreground" />
          <span className="text-sm">Create new organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
