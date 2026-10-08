"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { AddSubscriberDialog } from "@/components/newsletter/subscriber-manager";
import { ListCreateDialog } from "./list-create-dialog";
import { ListDeleteDialog } from "./list-delete-dialog";
import { ListEditDialog } from "./list-edit-dialog";
import { ListsHeaderStats } from "./lists-header-stats";
import { ListsTable } from "./lists-table";

interface ListsClientViewProps {
  lists: NewsletterListResponse[];
}

export function ListsClientView({ lists }: ListsClientViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingList, setEditingList] = useState<NewsletterListResponse | null>(null);
  const [deletingList, setDeletingList] = useState<NewsletterListResponse | null>(null);
  const [addingSubscriberList, setAddingSubscriberList] = useState<NewsletterListResponse | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Mailing Lists"
        description="Mailing lists determine audience segments for your campaigns. Configure default fallback lists, pause signups, or view subscribers."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <IconPlus className="size-4" />
            New List
          </Button>
        }
      />

      <ListsHeaderStats lists={lists} />

      <ListsTable
        lists={lists}
        onCreateNew={() => setCreateOpen(true)}
        onEdit={(list) => setEditingList(list)}
        onDelete={(list) => setDeletingList(list)}
        onAddSubscriber={(list) => setAddingSubscriberList(list)}
      />

      <ListCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ListEditDialog
        list={editingList}
        open={Boolean(editingList)}
        onOpenChange={(open) => !open && setEditingList(null)}
      />

      <ListDeleteDialog
        list={deletingList}
        open={Boolean(deletingList)}
        onOpenChange={(open) => !open && setDeletingList(null)}
      />

      <AddSubscriberDialog
        lists={lists}
        defaultListSlug={addingSubscriberList?.slug}
        open={Boolean(addingSubscriberList)}
        onOpenChange={(open) => !open && setAddingSubscriberList(null)}
      />
    </div>
  );
}
