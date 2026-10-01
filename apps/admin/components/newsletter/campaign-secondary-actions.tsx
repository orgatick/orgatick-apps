"use client";

import { NewsletterStatus } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { IconDotsVertical, IconFileDescription, IconPencil, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { deleteNewsletter, saveNewsletterAsTemplate } from "@/lib/newsletter.api";

/** Editing is only safe before delivery starts; archived campaigns become templates instead. */
const EDITABLE: NewsletterStatus[] = [NewsletterStatus.DRAFT, NewsletterStatus.PAUSED];
const DELETABLE: NewsletterStatus[] = [NewsletterStatus.DRAFT];

interface CampaignSecondaryActionsProps {
  campaignId: string;
  status: NewsletterStatus;
}

/** Overflow menu for campaign management that is not part of the send lifecycle. */
export function CampaignSecondaryActions({ campaignId, status }: CampaignSecondaryActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const saveAsTemplate = () => {
    startTransition(async () => {
      try {
        await saveNewsletterAsTemplate(campaignId);
        router.refresh();
        toast.success("Campaign copied to templates");
      } catch (error) {
        handleApiError(error, "Failed to save template");
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      try {
        await deleteNewsletter(campaignId);
        router.push("/newsletters");
        router.refresh();
        toast.success("Draft deleted");
      } catch (error) {
        handleApiError(error, "Failed to delete campaign");
      }
    });
  };

  if (!EDITABLE.includes(status) && !DELETABLE.includes(status)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {EDITABLE.includes(status) && (
        <Button variant="outline" size="sm" render={<Link href={`/newsletters/${campaignId}/edit`} />}>
          <IconPencil className="size-4" />
          Edit
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={pending} aria-label="More campaign actions">
              <IconDotsVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={saveAsTemplate}>
            <IconFileDescription className="size-4" />
            Save as template
          </DropdownMenuItem>
          {DELETABLE.includes(status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={remove}>
                <IconTrash className="size-4" />
                Delete draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
