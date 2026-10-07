"use client";

import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import type { OrganizationMemberResponse } from "@orgatick/contracts";
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
import { Button } from "@orgatick/ui/components/button";

interface RemoveMemberDialogProps {
  member: OrganizationMemberResponse;
  disabled: boolean;
  onConfirm: () => Promise<void>;
}

export function RemoveMemberDialog({ member, disabled, onConfirm }: RemoveMemberDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive hover:border-destructive/40 hover:text-destructive"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <IconTrash className="size-3.5" />
        Remove
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {member.user.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose access to this organization. You can invite them again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              setOpen(false);
            }}
          >
            Remove member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
