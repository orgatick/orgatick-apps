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
} from "@orgatick/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { Switch } from "@orgatick/ui/components/switch";
import { Textarea } from "@orgatick/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { updateNewsletterList } from "@/lib/newsletter.api";

interface ListEditDialogProps {
  list: NewsletterListResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListEditDialog({ list, open, onOpenChange }: ListEditDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || "");
      setIsActive(list.isActive);
      setIsDefault(list.isDefault);
    }
  }, [list]);

  const submit = () => {
    if (!list || !name.trim()) return;
    startTransition(async () => {
      try {
        await updateNewsletterList(list.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
          makeDefault: isDefault,
        });
        toast.success(`Mailing list "${name}" updated`);
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        handleApiError(error, "Failed to update mailing list");
      }
    });
  };

  if (!list) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Mailing List</DialogTitle>
          <DialogDescription>
            Update configuration for <span className="font-semibold text-foreground">{list.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="space-y-4 py-2">
          <Field>
            <FieldLabel htmlFor="edit-list-name">List Name</FieldLabel>
            <Input
              id="edit-list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Updates"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-list-slug">Slug Identifier</FieldLabel>
            <Input id="edit-list-slug" disabled value={list.slug} className="font-mono text-xs opacity-70" />
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              Slugs are permanent to avoid breaking signup forms and API integrations.
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-list-desc">Description</FieldLabel>
            <Textarea
              id="edit-list-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what subscribers receive..."
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="space-y-0.5">
              <label htmlFor="edit-list-active" className="text-xs font-medium cursor-pointer">
                Active Status
              </label>
              <p className="text-[11px] text-muted-foreground">Paused lists do not accept new public opt-ins.</p>
            </div>
            <Switch id="edit-list-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="space-y-0.5">
              <label htmlFor="edit-list-default" className="text-xs font-medium cursor-pointer">
                Make Default List
              </label>
              <p className="text-[11px] text-muted-foreground">Designates this as the primary fallback audience.</p>
            </div>
            <Switch id="edit-list-default" checked={isDefault} onCheckedChange={setIsDefault} />
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || name.trim().length < 2}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
