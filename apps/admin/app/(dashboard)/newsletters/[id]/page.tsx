import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconAlertTriangle, IconEye, IconUsers } from "@tabler/icons-react";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import { PageHeader } from "@/components/page-header";
import { BlockPreview } from "@/components/newsletter/block-preview";
import { CampaignActions } from "@/components/newsletter/campaign-actions";
import { CampaignSecondaryActions } from "@/components/newsletter/campaign-secondary-actions";
import { CampaignMetricsSection } from "@/components/newsletter/detail/campaign-metrics-section";
import { CampaignOverviewCard } from "@/components/newsletter/detail/campaign-overview-card";
import { CampaignRecipientsCard } from "@/components/newsletter/detail/campaign-recipients-card";
import {
  serverFetchNewsletter,
  serverFetchNewsletterOverview,
  serverFetchNewsletterRecipients,
} from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Campaign" };

type CampaignParams = { id: string };
type CampaignSearchParams = { page?: string; search?: string; status?: string };

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<CampaignParams>;
  searchParams: Promise<CampaignSearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = 25;

  const campaign = await serverFetchNewsletter(id).catch(() => null);
  if (!campaign) notFound();

  const [overview, recipients] = await Promise.all([
    serverFetchNewsletterOverview(id),
    serverFetchNewsletterRecipients(id, {
      page,
      limit,
      search: query.search?.trim(),
      status: query.status?.trim(),
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title={campaign.subject}
        description={`${campaign.listName ?? "No list"} · from ${campaign.fromName} <${campaign.fromEmail}>`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/newsletters" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Back to campaigns
            </Link>
            <CampaignActions campaignId={campaign.id} status={campaign.status} />
            <CampaignSecondaryActions campaignId={campaign.id} status={campaign.status} />
          </div>
        }
      />

      {campaign.errorMessage && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 p-4">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">Delivery Problem</p>
              <p className="text-xs text-muted-foreground">{campaign.errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <CampaignMetricsSection stats={overview.stats} />

      <CampaignOverviewCard campaign={campaign} overview={overview} />

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="preview">
            <div className="border-b border-border/80 px-4 pt-3">
              <TabsList>
                <TabsTrigger value="preview" className="gap-1.5 text-xs">
                  <IconEye className="size-3.5" />
                  Rendered Preview
                </TabsTrigger>
                <TabsTrigger value="recipients" className="gap-1.5 text-xs">
                  <IconUsers className="size-3.5" />
                  Recipients ({recipients.meta.total})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="p-4 sm:p-6 space-y-4">
              {campaign.content.map((b, i) => (
                <BlockPreview key={b.id ?? i} block={b} />
              ))}
            </TabsContent>

            <TabsContent value="recipients" className="p-0">
              <CampaignRecipientsCard recipients={recipients} page={page} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
