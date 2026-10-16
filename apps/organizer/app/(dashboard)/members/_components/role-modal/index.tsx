"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { IconShield } from "@tabler/icons-react";
import type { OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@orgatick/ui/components/dialog";
import { handleApiError } from "@/lib/apis/api-error";
import { createCustomRole, fetchAvailablePermissions, updateCustomRole } from "@/lib/apis/organization.api";
import { RoleBasicsSection } from "./role-basics-section";
import { RoleCategoryPills } from "./role-category-pills";
import { RoleCategorySidebar } from "./role-category-sidebar";
import { RoleModalFooter } from "./role-modal-footer";
import { useRoleModalStore } from "./role-modal.store";
import { RolePermissionsPane } from "./role-permissions-pane";

export interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: OrganizationRoleOptionResponse | null;
  onSuccess: () => void;
}

export function RoleModal({ open, onOpenChange, roleToEdit, onSuccess }: RoleModalProps) {
  const isEditing = Boolean(roleToEdit);

  const availablePermissions = useRoleModalStore((s) => s.availablePermissions);
  const selectedPermissions = useRoleModalStore((s) => s.selectedPermissions);
  const name = useRoleModalStore((s) => s.name);
  const description = useRoleModalStore((s) => s.description);
  const initialize = useRoleModalStore((s) => s.initialize);
  const setAvailablePermissions = useRoleModalStore((s) => s.setAvailablePermissions);
  const setLoadingPermissions = useRoleModalStore((s) => s.setLoadingPermissions);
  const setSubmitting = useRoleModalStore((s) => s.setSubmitting);
  const setErrors = useRoleModalStore((s) => s.setErrors);

  // Sync state on modal open
  useEffect(() => {
    if (open) {
      if (availablePermissions.length === 0) {
        setLoadingPermissions(true);
        fetchAvailablePermissions()
          .then((perms) => setAvailablePermissions(perms))
          .catch(() => setAvailablePermissions([]))
          .finally(() => setLoadingPermissions(false));
      }
      initialize(roleToEdit);
    }
  }, [open, roleToEdit, availablePermissions.length, initialize, setAvailablePermissions, setLoadingPermissions]);

  // Distinct category list
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    for (const p of availablePermissions) {
      catSet.add(p.category || "other");
    }
    return Array.from(catSet);
  }, [availablePermissions]);

  // Counts per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; selected: number }> = {};
    for (const cat of categories) {
      stats[cat] = { total: 0, selected: 0 };
    }
    for (const p of availablePermissions) {
      const cat = p.category || "other";
      if (!stats[cat]) stats[cat] = { total: 0, selected: 0 };
      stats[cat].total += 1;
      if (selectedPermissions.has(p.key)) {
        stats[cat].selected += 1;
      }
    }
    return stats;
  }, [categories, availablePermissions, selectedPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; permissions?: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Role name must be at least 2 characters.";
    }
    if (selectedPermissions.size === 0) {
      newErrors.permissions = "Please select at least one permission for this role.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const permissionsArray = Array.from(selectedPermissions);
      if (isEditing && roleToEdit) {
        await updateCustomRole(roleToEdit.id, {
          name: name.trim(),
          description: description.trim() || null,
          permissions: permissionsArray,
        });
        toast.success("Role updated successfully", {
          description: `Custom role "${name.trim()}" has been updated with ${permissionsArray.length} permissions.`,
        });
      } else {
        await createCustomRole({
          name: name.trim(),
          description: description.trim() || null,
          permissions: permissionsArray,
        });
        toast.success("Role created successfully", {
          description: `Custom role "${name.trim()}" is now available for this organization.`,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        handleApiError(
          error,
          isEditing ? "Failed to update role. Please try again." : "Failed to create role. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-4xl lg:max-w-5xl h-[92dvh] sm:h-[90vh] sm:max-h-[840px] p-0 flex flex-col overflow-hidden gap-0 border-border/70 shadow-2xl rounded-2xl">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 shrink-0 bg-background">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="size-4 sm:size-4.5" />
            </div>
            <div className="min-w-0 pr-6">
              <DialogTitle className="text-sm sm:text-base font-semibold truncate">
                {isEditing ? `Edit Role: ${roleToEdit?.name}` : "Create Custom Role"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isEditing
                  ? "Update role name, operational scope, and granted permissions for your team members."
                  : "Define a tailored role with specific permissions scoped exclusively to your organization."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <RoleBasicsSection />
          <RoleCategoryPills categories={categories} categoryStats={categoryStats} />

          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            <RoleCategorySidebar categories={categories} categoryStats={categoryStats} />
            <RolePermissionsPane />
          </div>

          <RoleModalFooter isEditing={isEditing} onClose={() => onOpenChange(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
