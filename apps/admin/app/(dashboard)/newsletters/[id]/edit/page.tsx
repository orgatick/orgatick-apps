import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsletterStatus } from "@orgatick/contracts";
import { CampaignComposer } from "@/components/newsletter/campaign-composer";
import { PageHeader } from "@/components/page-header";
import { CampaignStatusBadge } from "@/components/newsletter/status-badge";
import { serverFetchActiveTemplates, serverFetchNewsletter, serverFetchNewsletterLists } from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Edit campaign" };

/** Content is immutable once a send starts, so the editor only opens for drafts. */
const EDITABLE_STATUSES: NewsletterStatus[] = [NewsletterStatus.DRAFT, NewsletterStatus.PAUSED];

type CampaignParams = { id: string };

export default async function EditCampaignPage({ params }: { params: Promise<CampaignParams> }) {
  const { id } = await params;
  const campaign = await serverFetchNewsletter(id).catch(() => null);
  if (!campaign) notFound();

  if (!EDITABLE_STATUSES.includes(campaign.status)) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
        <PageHeader title="Campaign cannot be edited" />
        <CampaignStatusBadge status={campaign.status} />
        <p className="text-sm text-muted-foreground">
          Content is locked once delivery starts. Duplicate this campaign to change the message.
        </p>
      </div>
    );
  }

  const [lists, templates] = await Promise.all([serverFetchNewsletterLists(), serverFetchActiveTemplates()]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader title="Edit campaign" description={campaign.subject} />
      <CampaignComposer lists={lists} templates={templates} campaign={campaign} />
    </div>
  );
}
