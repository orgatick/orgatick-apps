import type { Metadata } from "next";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { PageHeader } from "@/components/page-header";
import { ListManager } from "@/components/newsletter/list-manager";
import { ListStatusBadge } from "@/components/newsletter/status-badge";
import { serverFetchNewsletterLists } from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Mailing lists" };

export default async function MailingListsPage() {
  const lists = await serverFetchNewsletterLists();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Mailing lists"
        description="Lists decide who receives a campaign. Archive a list to stop new sends without deleting history."
      />

      <ListManager lists={lists} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">List</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Scope</th>
                  <th className="px-4 py-2.5 text-right font-medium">Subscribers</th>
                  <th className="px-4 py-2.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {lists.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No mailing lists yet.
                    </td>
                  </tr>
                )}
                {lists.map((list) => (
                  <tr key={list.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">{list.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{list.description || "No description"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ListStatusBadge isActive={list.isActive} isDefault={list.isDefault} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs capitalize text-muted-foreground">{list.scope}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                      {list.subscriberCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(list.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
