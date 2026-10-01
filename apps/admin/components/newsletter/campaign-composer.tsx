"use client";

import type {
  NewsletterBlock,
  NewsletterListResponse,
  NewsletterResponse,
  NewsletterTemplateResponse,
} from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { Switch } from "@orgatick/ui/components/switch";
import { IconDeviceFloppy, IconSend } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BlockEditor } from "@/components/newsletter/block-editor";
import { handleApiError } from "@/lib/apis/api-error";
import { createNewsletter, updateNewsletter } from "@/lib/newsletter.api";

const STARTER_CONTENT: NewsletterBlock[] = [
  { type: "heading", text: "A headline worth opening", level: "h2", align: "left" },
  { type: "paragraph", text: "Hi {{ first_name }}, here is what changed this month.", align: "left" },
  { type: "button", text: "Read the full update", href: "https://orgatick.in", variant: "solid", align: "left" },
];

interface CampaignComposerProps {
  lists: NewsletterListResponse[];
  templates: NewsletterTemplateResponse[];
  campaign?: NewsletterResponse;
}

export function CampaignComposer({ lists, templates, campaign }: CampaignComposerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: campaign?.name ?? "",
    subject: campaign?.subject ?? "",
    previewText: campaign?.previewText ?? "",
    listId: campaign?.listId ?? lists[0]?.id ?? "",
    templateId: campaign?.templateId ?? "",
    fromName: campaign?.fromName ?? "",
    fromEmail: campaign?.fromEmail ?? "",
    replyTo: campaign?.replyTo ?? "",
    limit: campaign?.audience?.limit ? String(campaign.audience.limit) : "",
    onlyRegisteredUsers: campaign?.audience?.onlyRegisteredUsers ?? false,
  });
  const [content, setContent] = useState<NewsletterBlock[]>(
    campaign?.content?.length ? campaign.content : STARTER_CONTENT,
  );
  const [error, setError] = useState<string>();

  const set = (values: Partial<typeof form>) => setForm((current) => ({ ...current, ...values }));

  const persist = (sendNow: boolean) => {
    if (!form.subject.trim() || !form.listId || !form.fromName.trim() || !form.fromEmail.trim()) {
      setError("Subject, list, from name and from email are required.");
      return;
    }
    if (content.length === 0) {
      setError("Add at least one content block.");
      return;
    }
    setError(undefined);

    const payload: Record<string, unknown> = {
      name: form.name.trim() || form.subject.trim(),
      subject: form.subject.trim(),
      previewText: form.previewText.trim() || undefined,
      listId: form.listId,
      templateId: form.templateId || undefined,
      fromName: form.fromName.trim(),
      fromEmail: form.fromEmail.trim(),
      replyTo: form.replyTo.trim() || undefined,
      content,
      audience: {
        onlyRegisteredUsers: form.onlyRegisteredUsers,
        limit: form.limit ? Number(form.limit) : undefined,
      },
    };
    if (sendNow) payload.sendNow = true;

    startTransition(async () => {
      try {
        const saved = campaign ? await updateNewsletter(campaign.id, payload) : await createNewsletter(payload);
        toast.success(sendNow ? "Campaign queued for sending" : "Draft saved");
        router.push(`/newsletters/${saved.id}`);
      } catch (err) {
        handleApiError(err, sendNow ? "Failed to send campaign" : "Failed to save campaign");
      }
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs">
                Subject
              </Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(event) => set({ subject: event.target.value })}
                placeholder="What happened this month"
              />
              <p className="text-[11px] text-muted-foreground">
                Merge tags: {"{{ first_name }}"}, {"{{ list_name }}"}, {"{{ current_year }}"} are substituted per
                recipient.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Internal name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => set({ name: event.target.value })}
                  placeholder="Defaults to the subject"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="previewText" className="text-xs">
                  Preview text
                </Label>
                <Input
                  id="previewText"
                  value={form.previewText}
                  onChange={(event) => set({ previewText: event.target.value })}
                  placeholder="Shown after the subject in most inboxes"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockEditor value={content} onChange={setContent} error={error} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Mailing list</Label>
              <Select value={form.listId} onValueChange={(value) => set({ listId: value ?? "" })}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue>Select a list</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Template (optional)</Label>
              <Select value={form.templateId} onValueChange={(value) => set({ templateId: value ?? "" })}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue>Blocks only</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="limit" className="text-xs">
                Recipient limit
              </Label>
              <Input
                id="limit"
                type="number"
                min={1}
                value={form.limit}
                onChange={(event) => set({ limit: event.target.value })}
                placeholder="All confirmed subscribers"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="onlyRegistered" className="text-xs">
                Only registered users
              </Label>
              <Switch
                id="onlyRegistered"
                checked={form.onlyRegisteredUsers}
                onCheckedChange={(checked) => set({ onlyRegisteredUsers: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fromName" className="text-xs">
                From name
              </Label>
              <Input
                id="fromName"
                value={form.fromName}
                onChange={(event) => set({ fromName: event.target.value })}
                placeholder="Orgatick"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fromEmail" className="text-xs">
                From email
              </Label>
              <Input
                id="fromEmail"
                type="email"
                value={form.fromEmail}
                onChange={(event) => set({ fromEmail: event.target.value })}
                placeholder="news@orgatick.in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="replyTo" className="text-xs">
                Reply-to
              </Label>
              <Input
                id="replyTo"
                type="email"
                value={form.replyTo}
                onChange={(event) => set({ replyTo: event.target.value })}
                placeholder="Defaults to the from address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <Button className="w-full" onClick={() => persist(false)} disabled={pending}>
              <IconDeviceFloppy className="size-4" />
              Save draft
            </Button>
            <Button variant="outline" className="w-full" onClick={() => persist(true)} disabled={pending}>
              <IconSend className="size-4" />
              Save and send now
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
