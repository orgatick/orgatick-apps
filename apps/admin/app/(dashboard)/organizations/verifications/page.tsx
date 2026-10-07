import type { Metadata } from "next";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { serverFetchVerificationQueue } from "@/lib/admin.api";
import type { VerificationQueueQuery } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { VerificationQueueFilter } from "./_components/verification-queue-filter";
import { VerificationTableRow } from "./_components/verification-table-row";

export const metadata: Metadata = { title: "Verification Queue" };

type VerificationQueueSearchParams = {
  status?: string;
  page?: string;
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
                  data.items.map((item) => <VerificationTableRow key={String(item.organizationId)} item={item} />)
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
