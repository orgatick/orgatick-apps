import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconAlertTriangle,
  IconChartBar,
  IconEye,
  IconLink,
  IconMailForward,
  IconMailbox,
  IconUserMinus,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import type { NewsletterRecipientResponse } from "@orgatick/contracts";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { SearchInput } from "@/components/data-tools/search-input";
import { StatCard } from "@/components/stat-card";
import { BlockPreview } from "@/components/newsletter/block-preview";
import { CampaignActions } from "@/components/newsletter/campaign-actions";
import { CampaignSecondaryActions } from "@/components/newsletter/campaign-secondary-actions";
import { CampaignStatusBadge, RecipientStatusBadge } from "@/components/newsletter/status-badge";
import {
  formatPercent,
  serverFetchNewsletter,
  serverFetchNewsletterOverview,
  serverFetchNewsletterRecipients,
} from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Campaign" };

type CampaignParams = { id: string };
type CampaignSearchParams = { page?: string; search?: string; status?: string };

function RecipientRow({ recipient }: { recipient: NewsletterRecipientResponse }) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-4 py-3">
        <p className="truncate text-sm text-foreground">{recipient.email}</p>
      </td>
      <td className="px-4 py-3">
        <RecipientStatusBadge status={recipient.status} />
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">{recipient.openCount}</td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">{recipient.clickCount}</td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">{recipient.attemptCount}</td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">{formatTimestamp(recipient.sentAt)}</span>
      </td>
    </tr>
  );
}

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

  const { stats } = overview;

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
              <p className="text-sm font-semibold text-foreground">Delivery problem</p>
              <p className="text-xs text-muted-foreground">{campaign.errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recipients" value={stats.recipientCount} icon={IconMailbox} accent="primary" />
        <StatCard
          label="Delivered"
          value={stats.deliveredCount}
          hint={`${formatPercent(stats.bounceRate)} bounced`}
          icon={IconMailForward}
          accent="success"
        />
        <StatCard
          label="Open rate"
          value={formatPercent(stats.openRate)}
          hint={`${stats.openedCount} unique opens`}
          icon={IconEye}
        />
        <StatCard
          label="Click rate"
          value={formatPercent(stats.clickRate)}
          hint={`${stats.clickedCount} clicked`}
          icon={IconChartBar}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <CampaignStatusBadge status={campaign.status} />
              <span className="text-xs text-muted-foreground">
                Created {formatTimestamp(campaign.createdAt)}
                {campaign.createdByName ? ` by ${campaign.createdByName}` : ""}
              </span>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Internal name" value={campaign.name} />
              <Detail label="Preview text" value={campaign.previewText ?? "Not set"} />
              <Detail label="Scheduled for" value={formatTimestamp(campaign.scheduledAt)} />
              <Detail label="Sent at" value={formatTimestamp(campaign.sentAt)} />
              <Detail label="Reply-to" value={campaign.replyTo ?? campaign.fromEmail} />
              <Detail label="Template" value={campaign.templateName ?? "Custom content"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ReportRow label="Sent" value={stats.sentCount} />
            <ReportRow label="Bounced" value={stats.bouncedCount} />
            <ReportRow label="Complaints" value={stats.complainedCount} />
            <ReportRow label="Unsubscribed" value={stats.unsubscribedCount} icon={IconUserMinus} />
            <ReportRow label="Failed" value={stats.failedCount} />

            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Send activity</p>
              {overview.sendsByDay.length === 0 && (
                <p className="text-xs text-muted-foreground">No sends recorded in the last 30 days.</p>
              )}
              {overview.sendsByDay.slice(-7).map((day) => (
                <p key={day.date} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="tabular-nums">{day.count} sent</span>
                </p>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top links</p>
              {overview.topLinks.length === 0 && (
                <p className="text-xs text-muted-foreground">No clicks recorded yet.</p>
              )}
              {overview.topLinks.slice(0, 5).map((link) => (
                <p key={link.url} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <IconLink className="mt-0.5 size-3 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{link.url}</span>
                  <span className="tabular-nums">{link.count}</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="recipients">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
              <TabsList>
                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              <SearchInput placeholder="Search recipient email..." className="w-full max-w-xs" param="search" />
            </div>

            <TabsContent value="recipients" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Email</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 text-right font-medium">Opens</th>
                      <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                      <th className="px-4 py-2.5 text-right font-medium">Attempts</th>
                      <th className="px-4 py-2.5 font-medium">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          No recipients match this filter.
                        </td>
                      </tr>
                    )}
                    {recipients.items.map((recipient) => (
                      <RecipientRow key={recipient.id} recipient={recipient} />
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="content" className="m-0 p-4">
              <ol className="space-y-3">
                {campaign.content.map((block, index) => (
                  <li key={block.id ?? index} className="rounded-lg border border-border/60 p-3 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{block.type}</p>
                    <BlockPreview block={block} />
                  </li>
                ))}
              </ol>
              {campaign.hasHtmlOverride && (
                <p className="mt-3 text-xs text-muted-foreground">
                  This campaign uses a hand-built HTML override, so the blocks above are not rendered.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PaginationControls page={recipients.meta.page} totalPages={recipients.meta.totalPages} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm text-foreground">{value}</dd>
    </div>
  );
}

function ReportRow({ label, value, icon: Icon }: { label: string; value: number; icon?: typeof IconUserMinus }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function formatTimestamp(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
