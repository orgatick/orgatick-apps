"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@orgatick/ui/components/alert-dialog";
import { Button } from "@orgatick/ui/components/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { deleteNewsletterList } from "@/lib/newsletter.api";

interface ListDeleteDialogProps {
  list: NewsletterListResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListDeleteDialog({ list, open, onOpenChange }: ListDeleteDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!list) return null;

  const handleDelete = () => {
    if (list.isDefault) {
      toast.error("Cannot delete the default mailing list. Set another list as default first.");
      return;
    }

    startTransition(async () => {
      try {
        await deleteNewsletterList(list.id);
        toast.success(`Mailing list "${list.name}" deleted`);
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        handleApiError(error, "Failed to delete mailing list");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Mailing List</AlertDialogTitle>
          <AlertDialogDescription>
            {list.isDefault ? (
              <span className="text-destructive font-medium">
                This is the default mailing list and cannot be deleted. Please assign another list as default before
                removing it.
              </span>
            ) : (
              <>
                Are you sure you want to delete <span className="font-semibold text-foreground">{list.name}</span>?
                {list.subscriberCount > 0 && (
                  <span className="block mt-2 font-medium text-warning">
                    Warning: This list contains {list.subscriberCount.toLocaleString()} subscriber(s).
                  </span>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          {!list.isDefault && (
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? "Deleting..." : "Delete List"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
