"use client";

import { IconReload } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { DialogFooter } from "@orgatick/ui/components/dialog";
import { useRoleModalStore } from "./role-modal.store";

interface RoleModalFooterProps {
  isEditing: boolean;
  onClose: () => void;
}

export function RoleModalFooter({ isEditing, onClose }: RoleModalFooterProps) {
  const selectedCount = useRoleModalStore((s) => s.selectedPermissions.size);
  const totalCount = useRoleModalStore((s) => s.availablePermissions.length);
  const loadingPermissions = useRoleModalStore((s) => s.loadingPermissions);
  const submitting = useRoleModalStore((s) => s.submitting);
  const errors = useRoleModalStore((s) => s.errors);

  return (
    <DialogFooter className="flex sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Permission Selection Count & Validation Message */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground font-mono">{selectedCount}</span> of {totalCount} permissions
          selected
        </p>
        {errors.permissions && <p className="text-xs font-medium text-destructive">{errors.permissions}</p>}
      </div>

      {/* Right: Standard Shadcn Action Buttons */}
      <div className="flex items-center gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={submitting}
          className="sm:flex-initial"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting || loadingPermissions} className="sm:flex-initial">
          {submitting ? (
            <>
              <IconReload className="size-3.5 animate-spin" />
              <span>{isEditing ? "Saving…" : "Creating…"}</span>
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create role"
          )}
        </Button>
      </div>
    </DialogFooter>
  );
}
