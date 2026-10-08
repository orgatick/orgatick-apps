"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { IconPlus } from "@tabler/icons-react";
import { AddSubscriberDialog } from "./subscriber-manager";

interface AddSubscriberButtonProps {
  lists: NewsletterListResponse[];
  /** Slug to preselect, used when the surrounding page is already scoped to one list. */
  defaultListSlug?: string;
}

/** Toolbar trigger for AddSubscriberDialog, owning its own open state. */
export function AddSubscriberButton({ lists, defaultListSlug }: AddSubscriberButtonProps) {
  return (
    <AddSubscriberDialog
      lists={lists}
      defaultListSlug={defaultListSlug}
      trigger={
        <Button size="sm">
          <IconPlus className="size-4" />
          Add subscriber
        </Button>
      }
    />
  );
}
