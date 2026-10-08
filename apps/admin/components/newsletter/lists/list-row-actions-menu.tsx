"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import {
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { updateNewsletterList } from "@/lib/newsletter.api";

interface ListRowActionsMenuProps {
  list: NewsletterListResponse;
  onEdit: (list: NewsletterListResponse) => void;
  onDelete: (list: NewsletterListResponse) => void;
  onAddSubscriber: (list: NewsletterListResponse) => void;
}

export function ListRowActionsMenu({ list, onEdit, onDelete, onAddSubscriber }: ListRowActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggleActive = () => {
    startTransition(async () => {
      try {
        await updateNewsletterList(list.id, { isActive: !list.isActive });
        toast.success(list.isActive ? `List "${list.name}" paused` : `List "${list.name}" resumed`);
        router.refresh();
      } catch (error) {
        handleApiError(error, "Failed to update list status");
      }
    });
  };

  const setAsDefault = () => {
    startTransition(async () => {
      try {
        await updateNewsletterList(list.id, { makeDefault: true });
        toast.success(`"${list.name}" is now the default mailing list`);
        router.refresh();
      } catch (error) {
        handleApiError(error, "Failed to set default list");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" disabled={pending} aria-label={`Actions for ${list.name}`}>
            <IconDotsVertical className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href={`/subscribers?listId=${list.id}`} />}>
          <IconUsers className="size-4" />
          View subscribers
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAddSubscriber(list)} disabled={!list.isActive}>
          <IconUserPlus className="size-4" />
          Add subscriber
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEdit(list)}>
          <IconEdit className="size-4" />
          Edit settings
        </DropdownMenuItem>

        {!list.isDefault && (
          <DropdownMenuItem onClick={setAsDefault} disabled={pending}>
            <IconCheck className="size-4" />
            Set as default
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={toggleActive} disabled={pending}>
          {list.isActive ? (
            <>
              <IconPlayerPause className="size-4" />
              Pause list
            </>
          ) : (
            <>
              <IconPlayerPlay className="size-4" />
              Resume list
            </>
          )}
        </DropdownMenuItem>

        {!list.isDefault && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(list)}>
              <IconTrash className="size-4" />
              Delete list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
