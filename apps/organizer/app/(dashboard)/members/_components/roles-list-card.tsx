"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconKey,
  IconLock,
  IconPlus,
  IconSearch,
  IconShield,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import type { OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Input } from "@orgatick/ui/components/input";
import { RoleModal } from "./role-modal";
import { DeleteRoleDialog } from "./delete-role-dialog";

interface RolesListCardProps {
  roles: OrganizationRoleOptionResponse[];
  canUpdate: boolean;
}

export function RolesListCard({ roles, canUpdate }: RolesListCardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<OrganizationRoleOptionResponse | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<OrganizationRoleOptionResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const customRoles = useMemo(() => roles.filter((r) => r.isCustom), [roles]);
  const systemRoles = useMemo(() => roles.filter((r) => !r.isCustom), [roles]);

  const filteredCustomRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customRoles;
    return customRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        r.key.toLowerCase().includes(q),
    );
  }, [customRoles, searchQuery]);

  const filteredSystemRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return systemRoles;
    return systemRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        r.key.toLowerCase().includes(q),
    );
  }, [systemRoles, searchQuery]);

  const handleCreate = () => {
    setRoleToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (role: OrganizationRoleOptionResponse) => {
    setRoleToEdit(role);
    setModalOpen(true);
  };

  const handleDelete = (role: OrganizationRoleOptionResponse) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const toggleExpand = (roleId: string) => {
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by name or description…"
            className="ps-9 pe-8 text-xs h-9 bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        {canUpdate && (
          <Button size="sm" className="gap-2 shrink-0" onClick={handleCreate}>
            <IconPlus className="size-4" />
            Create custom role
          </Button>
        )}
      </div>

      {/* Custom Roles Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Organization Custom Roles</h3>
            <span className="font-mono text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/40">
              {customRoles.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Custom-scoped to your organization</span>
        </div>

        {customRoles.length === 0 ? (
          <Card className="border-border/60 border-dashed">
            <CardContent className="py-8">
              <Empty className="border-0">
                <EmptyMedia variant="icon">
                  <IconKey className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No custom roles created yet</EmptyTitle>
                  <EmptyDescription>
                    Create custom roles with specific permissions tailored to your organization (e.g. Finance Manager,
                    Speaker Coordinator, On-site Volunteer Lead).
                  </EmptyDescription>
                </EmptyHeader>
                {canUpdate && (
                  <Button size="sm" variant="outline" className="gap-2 mt-4" onClick={handleCreate}>
                    <IconPlus className="size-4" />
                    Create your first custom role
                  </Button>
                )}
              </Empty>
            </CardContent>
          </Card>
        ) : filteredCustomRoles.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-border/50 rounded-xl bg-card">
            No custom roles match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              const permissions = role.permissions ?? [];

              return (
                <div
                  key={role.id}
                  className="rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-colors flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate">{role.name}</span>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                            Custom
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {role.description || "No description provided."}
                        </p>
                      </div>

                      {canUpdate && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEdit(role)}
                            aria-label={`Edit ${role.name}`}
                          >
                            <IconEdit className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(role)}
                            aria-label={`Delete ${role.name}`}
                          >
                            <IconTrash className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <IconUsers className="size-3.5" />
                        <span>
                          {role.memberCount ?? 0} {role.memberCount === 1 ? "member" : "members"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconShield className="size-3.5" />
                        <span>{permissions.length} permissions</span>
                      </div>
                    </div>

                    {permissions.length > 0 && (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(role.id)}
                          className="flex items-center justify-between w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide permissions" : "View permissions"}</span>
                          {isExpanded ? (
                            <IconChevronUp className="size-3.5" />
                          ) : (
                            <IconChevronDown className="size-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="flex flex-wrap gap-1 p-2.5 rounded-lg bg-muted/40 border border-border/40 max-h-36 overflow-y-auto">
                            {permissions.map((permKey) => (
                              <span
                                key={permKey}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-foreground"
                              >
                                {permKey}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* System Default Roles Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">System Default Roles</h3>
            <span className="font-mono text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/40">
              {systemRoles.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Standard roles available across Orgatick</span>
        </div>

        {filteredSystemRoles.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-border/50 rounded-xl bg-card">
            No system roles match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSystemRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              const permissions = role.permissions ?? [];

              return (
                <div
                  key={role.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate">{role.name}</span>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/40">
                            System
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {role.description || "System standard role."}
                        </p>
                      </div>

                      <div className="text-muted-foreground/60 p-1" title="System-managed role (cannot be modified)">
                        <IconLock className="size-4" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <IconUsers className="size-3.5" />
                        <span>
                          {role.memberCount ?? 0} {role.memberCount === 1 ? "member" : "members"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconShield className="size-3.5" />
                        <span>{permissions.length > 0 ? `${permissions.length} permissions` : "All permissions"}</span>
                      </div>
                    </div>

                    {permissions.length > 0 && (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(role.id)}
                          className="flex items-center justify-between w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide permissions" : "View permissions"}</span>
                          {isExpanded ? (
                            <IconChevronUp className="size-3.5" />
                          ) : (
                            <IconChevronDown className="size-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="flex flex-wrap gap-1 p-2.5 rounded-lg bg-muted/40 border border-border/40 max-h-36 overflow-y-auto">
                            {permissions.map((permKey) => (
                              <span
                                key={permKey}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-foreground"
                              >
                                {permKey}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Role Creation / Editing Modal */}
      <RoleModal open={modalOpen} onOpenChange={setModalOpen} roleToEdit={roleToEdit} onSuccess={handleSuccess} />

      {/* Role Deletion Dialog */}
      <DeleteRoleDialog
        role={roleToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
