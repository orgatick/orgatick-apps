"use client";

import type {
  NewsletterBlock,
  NewsletterListResponse,
  NewsletterResponse,
  NewsletterTemplateResponse,
} from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import {
  IconDeviceFloppy,
  IconDeviceMobile,
  IconEye,
  IconMailForward,
  IconPencil,
  IconSend,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BlockEditor } from "@/components/newsletter/block-editor";
import { BlockPreview } from "@/components/newsletter/block-preview";
import { CampaignMetadataCard } from "./composer/campaign-metadata-card";
import { CampaignSenderCard } from "./composer/campaign-sender-card";
import { CampaignTestDialog } from "./composer/campaign-test-dialog";
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
  const [testOpen, setTestOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [form, setForm] = useState({
    name: campaign?.name ?? "",
    subject: campaign?.subject ?? "",
    previewText: campaign?.previewText ?? "",
    listId: campaign?.listId ?? lists[0]?.id ?? "",
    templateId: campaign?.templateId ?? "",
    fromName: campaign?.fromName ?? "Orgatick Team",
    fromEmail: campaign?.fromEmail ?? "newsletter@orgatick.in",
    replyTo: campaign?.replyTo ?? "",
    limit: campaign?.audience?.limit ? String(campaign.audience.limit) : "",
    onlyRegisteredUsers: campaign?.audience?.onlyRegisteredUsers ?? false,
  });

  const [content, setContent] = useState<NewsletterBlock[]>(
    campaign?.content?.length ? campaign.content : STARTER_CONTENT,
  );
  const [error, setError] = useState<string>();

  const patchForm = (values: Record<string, string | boolean>) => {
    setForm((current) => ({ ...current, ...values }));
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none" || !templateId) {
      patchForm({ templateId: "" });
      return;
    }
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      patchForm({
        templateId,
        subject: form.subject || selected.subject,
        previewText: form.previewText || selected.previewText || "",
      });
      if (selected.content?.length) {
        setContent(selected.content);
      }
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-4">
        <div>
          <h2 className="text-lg font-semibold">{campaign ? "Edit Campaign" : "New Campaign"}</h2>
          <p className="text-xs text-muted-foreground">
            Draft and preview your newsletter before scheduling or sending.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {campaign && (
            <Button type="button" variant="outline" size="sm" onClick={() => setTestOpen(true)}>
              <IconMailForward className="size-4" />
              Send Test
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => persist(false)}>
            <IconDeviceFloppy className="size-4" />
            {pending ? "Saving..." : "Save Draft"}
          </Button>
          <Button type="button" size="sm" disabled={pending} onClick={() => persist(true)}>
            <IconSend className="size-4" />
            {pending ? "Queueing..." : "Send Now"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <CampaignMetadataCard
            name={form.name}
            subject={form.subject}
            previewText={form.previewText}
            listId={form.listId}
            templateId={form.templateId}
            lists={lists}
            templates={templates}
            onChange={patchForm}
            onTemplateChange={handleTemplateChange}
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
            <div className="flex items-center justify-between pb-2">
              <TabsList>
                <TabsTrigger value="edit" className="gap-1.5 text-xs">
                  <IconPencil className="size-3.5" />
                  Visual Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5 text-xs">
                  <IconEye className="size-3.5" />
                  Live Preview
                </TabsTrigger>
              </TabsList>
              {activeTab === "preview" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => setPreviewDevice("desktop")}
                    title="Desktop view"
                  >
                    <IconEye className="size-3.5" />
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => setPreviewDevice("mobile")}
                    title="Mobile view"
                  >
                    <IconDeviceMobile className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="edit" className="mt-0">
              <BlockEditor value={content} onChange={setContent} error={error} />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div
                className={`mx-auto transition-all ${previewDevice === "mobile" ? "max-w-[390px] border border-border/80 rounded-2xl p-4 shadow-sm" : "w-full"}`}
              >
                <div className="space-y-4">
                  {content.map((b, i) => (
                    <BlockPreview key={b.id ?? i} block={b} />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <CampaignSenderCard
            fromName={form.fromName}
            fromEmail={form.fromEmail}
            replyTo={form.replyTo}
            limit={form.limit}
            onlyRegisteredUsers={form.onlyRegisteredUsers}
            onChange={patchForm}
          />
        </div>
      </div>

      <CampaignTestDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        campaignId={campaign?.id}
        defaultEmail={form.fromEmail}
      />
    </div>
  );
}
