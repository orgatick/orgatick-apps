import type { NewsletterRecipientResponse } from "@orgatick/contracts";
import { PaginationControls } from "@/components/data-tools/pagination";
import { SearchInput } from "@/components/data-tools/search-input";
import { RecipientStatusBadge } from "@/components/newsletter/status-badge";
import type { Paginated } from "@/lib/types";

function formatTimestamp(value?: Date | string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CampaignRecipientsCard({
  recipients,
  page,
}: {
  recipients: Paginated<NewsletterRecipientResponse>;
  page: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="w-full max-w-sm">
          <SearchInput placeholder="Search recipient email..." />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Opens</th>
              <th className="px-4 py-3 text-right">Clicks</th>
              <th className="px-4 py-3 text-right">Tries</th>
              <th className="px-4 py-3">Sent At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {recipients.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                  No recipients found matching query.
                </td>
              </tr>
            ) : (
              recipients.items.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3">
                    <p className="truncate font-mono text-xs text-foreground">{recipient.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RecipientStatusBadge status={recipient.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                    {recipient.openCount}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                    {recipient.clickCount}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                    {recipient.attemptCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatTimestamp(recipient.sentAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/40">
        <PaginationControls totalPages={recipients.meta.totalPages} page={page} />
      </div>
    </div>
  );
}
