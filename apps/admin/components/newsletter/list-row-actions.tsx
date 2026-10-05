"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { AddSubscriberDialog } from "@/components/newsletter/subscriber-manager";

interface ListRowActionsProps {
  list: NewsletterListResponse;
  /** Every list, so the dialog can still offer a different target than the row's own list. */
  lists: NewsletterListResponse[];
}

/**
 * Row actions for a mailing list: add a subscriber scoped to this list, or jump to the filtered
 * subscriber table. Client side so the table stays a server component.
 */
export function ListRowActions({ list, lists }: ListRowActionsProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!list.isActive}
        aria-label={`Add subscriber to ${list.name}`}
        title={list.isActive ? "Add subscriber" : "Resume the list to add subscribers"}
        onClick={() => setAddOpen(true)}
        render={<IconUserPlus className="size-2" />}
      ></Button>
      <Button variant="ghost" size="sm" render={<Link href={`/subscribers?listId=${list.id}`} />}>
        View
      </Button>
      <AddSubscriberDialog lists={lists} defaultListSlug={list.slug} open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
