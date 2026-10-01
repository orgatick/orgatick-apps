"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orgatick/ui/components/dialog";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Switch } from "@orgatick/ui/components/switch";
import { Textarea } from "@orgatick/ui/components/textarea";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { createNewsletterList, updateNewsletterList } from "@/lib/newsletter.api";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ListManagerProps {
  lists: NewsletterListResponse[];
}

/** Create a list, or pause/resume an existing one from the toolbar. */
export function ListManager({ lists }: ListManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const submit = () => {
    startTransition(async () => {
      try {
        await createNewsletterList({
          name: name.trim(),
          slug: slugify(slug || name),
          description: description.trim() || undefined,
          makeDefault,
        });
        setOpen(false);
        setName("");
        setSlug("");
        setSlugTouched(false);
        setDescription("");
        setMakeDefault(false);
        router.refresh();
        toast.success("Mailing list created");
      } catch (error) {
        handleApiError(error, "Failed to create mailing list");
      }
    });
  };

  const toggleActive = (list: NewsletterListResponse) => {
    startTransition(async () => {
      try {
        await updateNewsletterList(list.id, { isActive: !list.isActive });
        router.refresh();
        toast.success(list.isActive ? "List paused" : "List resumed");
      } catch (error) {
        handleApiError(error, "Failed to update mailing list");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {lists.length} list{lists.length === 1 ? "" : "s"} · {lists.filter((list) => list.isActive).length} active
      </p>

      <div className="flex items-center gap-2">
        {lists.map((list) =>
          list.isDefault ? null : (
            <Button key={list.id} variant="ghost" size="sm" disabled={pending} onClick={() => toggleActive(list)}>
              {list.isActive ? `Pause ${list.name}` : `Resume ${list.name}`}
            </Button>
          ),
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <IconPlus className="size-4" />
                New list
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New mailing list</DialogTitle>
              <DialogDescription>
                Subscribers choose this list from the public signup form. The slug is derived from the name unless you
                override it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="list-name">Name</Label>
                <Input
                  id="list-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!slugTouched) setSlug(slugify(event.target.value));
                  }}
                  placeholder="Product updates"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="list-slug">Slug</Label>
                <Input
                  id="list-slug"
                  className="font-mono text-xs"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  placeholder="product-updates"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="list-description">Description</Label>
                <Textarea
                  id="list-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What subscribers get"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="list-default" className="text-xs">
                  Make this the default list
                </Label>
                <Switch id="list-default" checked={makeDefault} onCheckedChange={setMakeDefault} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={pending || name.trim().length < 2}>
                Create list
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
