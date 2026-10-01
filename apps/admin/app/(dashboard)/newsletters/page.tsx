import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight, IconPlus } from "@tabler/icons-react";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { SearchInput } from "@/components/data-tools/search-input";
import { CampaignListFilter, CampaignStatusFilter } from "@/components/newsletter/filters";
import { CampaignStatusBadge } from "@/components/newsletter/status-badge";
import { formatPercent, serverFetchNewsletterLists, serverFetchNewsletters } from "@/lib/newsletter.api";
import type { NewsletterResponse } from "@orgatick/contracts";

export const metadata: Metadata = { title: "Newsletters" };

type NewslettersSearchParams = {
  search?: string;
  status?: string;
  listId?: string;
  page?: string;
};

function CampaignRow({ campaign }: { campaign: NewsletterResponse }) {
  const { stats } = campaign;

  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-4 py-3">
        <p className="truncate text-sm font-semibold text-foreground">{campaign.subject}</p>
        <p className="truncate text-xs text-muted-foreground">
          {campaign.listName ?? "No list"}
          {campaign.scheduledAt ? ` · scheduled ${formatDate(campaign.scheduledAt)}` : ""}
        </p>
      </td>
      <td className="px-4 py-3">
        <CampaignStatusBadge status={campaign.status} />
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
        {stats.deliveredCount}/{stats.recipientCount}
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
        {formatPercent(stats.openRate)}
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
        {formatPercent(stats.clickRate)}
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
        {formatPercent(stats.bounceRate)}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">{formatDate(campaign.createdAt)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/newsletters/${campaign.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Open <IconArrowUpRight className="size-3.5" />
        </Link>
      </td>
    </tr>
  );
}

export default async function NewslettersPage({ searchParams }: { searchParams: Promise<NewslettersSearchParams> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = 20;
  const search = params.search?.trim();
  const status = params.status?.trim();
  const listId = params.listId?.trim();

  const [data, lists] = await Promise.all([
    serverFetchNewsletters({ page, limit, search, status, listId }),
    serverFetchNewsletterLists(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Newsletters"
        description="Campaigns, delivery status and engagement for every list."
        actions={
          <LinkButton href="/newsletters/new" icon={<IconPlus className="size-4" />}>
            New campaign
          </LinkButton>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search subject or name..." className="w-full max-w-sm" />
        <CampaignStatusFilter />
        <CampaignListFilter lists={lists} />
        {(search || status || listId) && (
          <p className="text-xs text-muted-foreground">
            {data.meta.total} campaign{data.meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Campaign</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Delivered</th>
                  <th className="px-4 py-2.5 text-right font-medium">Open</th>
                  <th className="px-4 py-2.5 text-right font-medium">Click</th>
                  <th className="px-4 py-2.5 text-right font-medium">Bounce</th>
                  <th className="px-4 py-2.5 font-medium">Created</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No campaigns yet. Create one to start sending.
                    </td>
                  </tr>
                )}
                {data.items.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PaginationControls page={data.meta.page} totalPages={data.meta.totalPages} />
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
