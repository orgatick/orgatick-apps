"use client";

import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orgatick/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { Switch } from "@orgatick/ui/components/switch";
import { Textarea } from "@orgatick/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { createNewsletterList } from "@/lib/newsletter.api";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ListCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListCreateDialog({ open, onOpenChange }: ListCreateDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const reset = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setMakeDefault(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const submit = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createNewsletterList({
          name: name.trim(),
          slug: slugify(slug || name),
          description: description.trim() || undefined,
          makeDefault,
        });
        toast.success(`Mailing list "${name}" created`);
        handleOpenChange(false);
        router.refresh();
      } catch (error) {
        handleApiError(error, "Failed to create mailing list");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Mailing List</DialogTitle>
          <DialogDescription>
            Lists segment your subscribers. Public signup forms can subscribe directly to this list.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="space-y-4 py-2">
          <Field>
            <FieldLabel htmlFor="create-list-name">List Name</FieldLabel>
            <Input
              id="create-list-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Monthly Newsletter"
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="create-list-slug">URL Slug</FieldLabel>
            <Input
              id="create-list-slug"
              className="font-mono text-xs"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="monthly-newsletter"
            />
            <p className="font-mono text-[11px] text-muted-foreground mt-1">
              api identifier: {slugify(slug || name) || "..."}
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="create-list-desc">Description</FieldLabel>
            <Textarea
              id="create-list-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what subscribers can expect to receive..."
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="space-y-0.5">
              <label htmlFor="create-list-default" className="text-xs font-medium cursor-pointer">
                Set as Default List
              </label>
              <p className="text-[11px] text-muted-foreground">New signups without a designated list go here.</p>
            </div>
            <Switch id="create-list-default" checked={makeDefault} onCheckedChange={setMakeDefault} />
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || name.trim().length < 2}>
            {pending ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
