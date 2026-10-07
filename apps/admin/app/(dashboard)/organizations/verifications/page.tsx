import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Avatar, AvatarFallback } from "@orgatick/ui/components/avatar";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { serverFetchVerificationQueue } from "@/lib/admin.api";
import type { VerificationQueueQuery } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { VerificationQueueFilter } from "./_components/verification-queue-filter";

export const metadata: Metadata = { title: "Verification Queue" };

type VerificationQueueSearchParams = {
  status?: string;
  page?: string;
};

const statusBadgeClass: Record<string, string> = {
  verified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const orgStatusBadgeClass: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  suspended: "bg-destructive/10 text-destructive",
  inactive: "bg-muted text-muted-foreground",
};

export default async function VerificationQueuePage({
  searchParams,
}: {
  searchParams: Promise<VerificationQueueSearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const status: VerificationQueueQuery["status"] =
    params.status === "pending" || params.status === "verified" || params.status === "rejected"
      ? params.status
      : undefined;

  const data = await serverFetchVerificationQueue({ page, limit: 20, status });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Verification queue"
        description="Organizations waiting for document review. Open an entry to review and verify it."
      />

      <div className="flex flex-wrap items-center gap-2">
        <VerificationQueueFilter value={status} />
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
                  <th className="px-4 py-2.5 font-medium">Organization</th>
                  <th className="px-4 py-2.5 font-medium">Owner</th>
                  <th className="px-4 py-2.5 font-medium">Verification</th>
                  <th className="px-4 py-2.5 font-medium">Org status</th>
                  <th className="px-4 py-2.5 font-medium">Documents</th>
                  <th className="px-4 py-2.5 font-medium">Verified at</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No organizations in the queue.
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr key={String(item.organizationId)} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                            {item.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.logo} alt="" className="size-7 rounded object-cover" />
                            ) : (
                              <span className="font-mono text-xs">{item.organizationId}</span>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.organizationName}</p>
                            <p className="truncate text-xs text-muted-foreground">@{item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.ownerName ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6 shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 font-mono text-[8px] font-bold text-white">
                                {item.ownerName
                                  .trim()
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-40 truncate text-sm text-foreground">{item.ownerName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 font-mono text-[9px] capitalize ${statusBadgeClass[item.status]}`}
                        >
                          {item.status}
                        </Badge>
                        {item.rejectionReason && (
                          <p
                            className="mt-1 max-w-48 truncate text-[11px] text-muted-foreground"
                            title={item.rejectionReason}
                          >
                            {item.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.orgStatus ? (
                          <Badge
                            variant="secondary"
                            className={`px-1.5 py-0 font-mono text-[9px] capitalize ${orgStatusBadgeClass[item.orgStatus]}`}
                          >
                            {item.orgStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {item.documentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.verifiedAt ? (
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {new Date(item.verifiedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/organizations/${item.organizationId}/verification`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Review <IconArrowUpRight className="size-3.5" />
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
