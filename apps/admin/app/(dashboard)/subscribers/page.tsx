import type { Metadata } from "next";
import { IconAddressBook, IconUserCheck, IconUserMinus, IconUsersGroup } from "@tabler/icons-react";
import { Card, CardContent } from "@orgatick/ui/components/card";
import type { NewsletterSubscriberResponse } from "@orgatick/contracts";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { SearchInput } from "@/components/data-tools/search-input";
import { StatCard } from "@/components/stat-card";
import { SubscriberListFilter, SubscriberStatusFilter } from "@/components/newsletter/filters";
import { SubscriberStatusSwitch } from "@/components/newsletter/subscriber-status-switch";
import { SubscriberStatusBadge } from "@/components/newsletter/status-badge";
import {
  serverFetchNewsletterLists,
  serverFetchNewsletterSubscribers,
  serverFetchNewsletterSubscriberStats,
} from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Subscribers" };

type SubscribersSearchParams = {
  search?: string;
  status?: string;
  listId?: string;
  page?: string;
};

function SubscriberRow({ subscriber }: { subscriber: NewsletterSubscriberResponse }) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-4 py-3">
        <p className="truncate text-sm font-semibold text-foreground">{subscriber.name || "No name"}</p>
        <p className="truncate text-xs text-muted-foreground">{subscriber.email}</p>
      </td>
      <td className="px-4 py-3">
        <SubscriberStatusBadge status={subscriber.status} />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">{subscriber.listName ?? "-"}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs capitalize text-muted-foreground">
          {subscriber.source.replace("_", " ")}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">{formatDate(subscriber.confirmedAt)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <SubscriberStatusSwitch subscriberId={subscriber.id} currentStatus={subscriber.status} />
      </td>
    </tr>
  );
}

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<SubscribersSearchParams> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = 25;
  const search = params.search?.trim();
  const status = params.status?.trim();
  const listId = params.listId?.trim();

  const [data, stats, lists] = await Promise.all([
    serverFetchNewsletterSubscribers({ page, limit, search, status, listId }),
    serverFetchNewsletterSubscriberStats(listId),
    serverFetchNewsletterLists(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Subscribers"
        description="Double opt-in subscribers across every mailing list, with suppression state."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={IconUsersGroup} accent="primary" />
        <StatCard label="Subscribed" value={stats.subscribed} icon={IconUserCheck} accent="success" />
        <StatCard
          label="Unsubscribed"
          value={stats.unsubscribed}
          icon={IconUserMinus}
          hint={`${percent(stats.unsubscribed, stats.unsubscribed + stats.subscribed)} of confirmed`}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={IconAddressBook}
          hint={`${stats.bounced + stats.complained} suppressed`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search email or name..." className="w-full max-w-sm" />
        <SubscriberStatusFilter />
        <SubscriberListFilter lists={lists} />
        {(search || status || listId) && (
          <p className="text-xs text-muted-foreground">
            {data.meta.total} subscriber{data.meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Subscriber</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">List</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 font-medium">Confirmed</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No subscribers match this filter.
                    </td>
                  </tr>
                )}
                {data.items.map((subscriber) => (
                  <SubscriberRow key={subscriber.id} subscriber={subscriber} />
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

function percent(value: number, total: number): string {
  return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
}

function formatDate(value: string | null): string {
  if (!value) return "Not confirmed";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
