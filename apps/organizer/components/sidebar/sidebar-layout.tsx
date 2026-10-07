"use client";

import type { UserResponse } from "@orgatick/contracts";
import { useState } from "react";
import { handleApiError } from "@/lib/apis/api-error";
import { switchOrganization } from "@/lib/apis/organization.api";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import { SidebarDesktop } from "./sidebar-desktop";
import { SidebarMobileSheet, SidebarMobileTopbar } from "./sidebar-mobile";

interface SidebarLayoutProps {
  user: UserResponse;
  organizations: SidebarOrganization[];
  initialOrgId?: string | number | null;
  children: React.ReactNode;
}

export function SidebarLayout({ user, organizations, initialOrgId, children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<string | number | null>(
    initialOrgId ?? organizations[0]?.organization.id ?? null,
  );

  const handleOrgChange = async (id: string | number) => {
    setActiveOrgId(id);
    try {
      await switchOrganization(id);
      window.location.reload();
    } catch (error) {
      handleApiError(error, "Failed to switch organization");
    }
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <SidebarDesktop
        user={user}
        organizations={organizations}
        activeOrgId={activeOrgId}
        onOrgChange={handleOrgChange}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <SidebarMobileTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <SidebarMobileSheet
        user={user}
        organizations={organizations}
        activeOrgId={activeOrgId}
        onOrgChange={handleOrgChange}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
    </div>
  );
}
