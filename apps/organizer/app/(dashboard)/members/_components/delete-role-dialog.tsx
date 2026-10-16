"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OrganizationRoleOptionResponse } from "@orgatick/contracts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@orgatick/ui/components/alert-dialog";
import { handleApiError } from "@/lib/apis/api-error";
import { deleteCustomRole } from "@/lib/apis/organization.api";

interface DeleteRoleDialogProps {
  role: OrganizationRoleOptionResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteRoleDialog({ role, open, onOpenChange, onSuccess }: DeleteRoleDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!role) return null;

  const hasAssignedMembers = (role.memberCount ?? 0) > 0;

  const handleDelete = async () => {
    if (hasAssignedMembers) return;
    setDeleting(true);
    try {
      await deleteCustomRole(role.id);
      toast.success("Role deleted", {
        description: `Custom role "${role.name}" was successfully removed.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(handleApiError(error, "Failed to delete role. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="size-5 text-destructive shrink-0" />
            <span>Delete Role: {role.name}?</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasAssignedMembers ? (
              <span className="text-destructive font-medium">
                Cannot delete this role because {role.memberCount} member(s) are currently assigned to it. Please
                reassign those members to another role before deleting.
              </span>
            ) : (
              <span>
                Are you sure you want to delete this custom role? This action cannot be undone. Organization members
                will no longer be able to select or use this role.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{hasAssignedMembers ? "Close" : "Cancel"}</AlertDialogCancel>
          {!hasAssignedMembers && (
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete role"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
