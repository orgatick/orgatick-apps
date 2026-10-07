import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { serverFetchOwnershipDisputes } from "@/lib/admin.api";
import type { DisputeStatus, OwnershipDisputeListQuery } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { DisputeFilters } from "./_components/dispute-filters";

export const metadata: Metadata = { title: "Ownership Disputes" };

type DisputesSearchParams = {
  status?: string;
  page?: string;
};

const statusBadgeClass: Record<DisputeStatus, string> = {
  open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  investigating: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-muted text-muted-foreground",
};

export default async function DisputesPage({ searchParams }: { searchParams: Promise<DisputesSearchParams> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const status: OwnershipDisputeListQuery["status"] =
    params.status === "open" ||
    params.status === "investigating" ||
    params.status === "resolved" ||
    params.status === "rejected"
      ? params.status
      : undefined;

  const data = await serverFetchOwnershipDisputes({ page, limit: 20, status });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Ownership disputes"
        description="Disputes filed by members claiming organization ownership. Ownership can be frozen while a dispute is reviewed."
      />

      <div className="flex flex-wrap items-center gap-2">
        <DisputeFilters value={status} />
        {data.meta.total > 0 && (
          <p className="text-xs text-muted-foreground">
            {data.meta.total} result{data.meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Dispute</th>
                  <th className="px-4 py-2.5 font-medium">Organization</th>
                  <th className="px-4 py-2.5 font-medium">Disputant</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Frozen</th>
                  <th className="px-4 py-2.5 font-medium">Filed at</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No ownership disputes found.
                    </td>
                  </tr>
                ) : (
                  data.items.map((dispute) => (
                    <tr key={String(dispute.id)} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          #{dispute.id}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        {dispute.organization ? (
                          <Link
                            href={`/organizations/${dispute.organizationId}`}
                            className="block max-w-52 truncate text-sm font-medium text-foreground hover:underline"
                          >
                            {dispute.organization.name}
                            <span className="block truncate text-xs font-normal text-muted-foreground">
                              @{dispute.organization.slug}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="max-w-40 truncate text-sm text-foreground">
                          {dispute.disputant?.name ?? "Member"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 font-mono text-[9px] capitalize ${statusBadgeClass[dispute.status]}`}
                        >
                          {dispute.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {dispute.freezeOwnership ? (
                          <Badge variant="destructive" className="px-1.5 py-0 font-mono text-[9px]">
                            frozen
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {new Date(dispute.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/disputes/${dispute.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Open <IconArrowUpRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PaginationControls page={page} totalPages={data.meta.totalPages} />
    </div>
  );
}
