"use client";

import { NewsletterTemplateStatus } from "@orgatick/contracts";
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
import { Textarea } from "@orgatick/ui/components/textarea";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { createNewsletterTemplate, deleteNewsletterTemplate, setTemplateStatus } from "@/lib/newsletter.api";

/** Starter content so a new template is immediately sendable. */
const STARTER_HTML = `<p>Hi {{ first_name }},</p><p>Write the opening paragraph here.</p><p><a href="https://orgatick.in">Read more</a></p>`;

interface TemplateManagerProps {
  compact?: boolean;
  templateId?: string;
  currentStatus?: NewsletterTemplateStatus;
}

export function TemplateManager({ compact = false, templateId, currentStatus }: TemplateManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [html, setHtml] = useState(STARTER_HTML);

  const submit = () => {
    startTransition(async () => {
      try {
        await createNewsletterTemplate({
          name: name.trim(),
          subject: subject.trim(),
          category: category.trim() || undefined,
          htmlOverride: html,
          status: NewsletterTemplateStatus.DRAFT,
        });
        setOpen(false);
        setName("");
        setSubject("");
        setCategory("");
        setHtml(STARTER_HTML);
        router.refresh();
        toast.success("Template created as a draft");
      } catch (error) {
        handleApiError(error, "Failed to create template");
      }
    });
  };

  const setStatus = (status: "publish" | "archive") => {
    if (!templateId) return;
    startTransition(async () => {
      try {
        await setTemplateStatus(templateId, status);
        router.refresh();
        toast.success(status === "publish" ? "Template published" : "Template archived");
      } catch (error) {
        handleApiError(error, "Failed to update template status");
      }
    });
  };

  const remove = () => {
    if (!templateId) return;
    startTransition(async () => {
      try {
        await deleteNewsletterTemplate(templateId);
        router.refresh();
        toast.success("Template deleted");
      } catch (error) {
        handleApiError(error, "Failed to delete template");
      }
    });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        {currentStatus === NewsletterTemplateStatus.ACTIVE ? (
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => setStatus("archive")}>
            Archive
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => setStatus("publish")}>
            Publish
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" disabled={pending} onClick={remove} aria-label="Delete template">
          <IconTrash className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <IconPlus className="size-4" />
            New template
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New newsletter template</DialogTitle>
          <DialogDescription>
            Templates start as drafts. Publish one to make it selectable when composing a campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Monthly digest"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Product update"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-subject">Default subject</Label>
            <Input
              id="template-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="What happened in {{ list_name }} this month"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-html">Content (inline HTML)</Label>
            <Textarea
              id="template-html"
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Merge tags: {"{{ first_name }}"}, {"{{ list_name }}"}, {"{{ current_year }}"}. Block tags are stripped on
              render.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !name.trim() || !subject.trim() || !html.trim()}>
            Create draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
