import type { Metadata } from "next";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/data-tools/pagination";
import { SearchInput } from "@/components/data-tools/search-input";
import { TemplateManager } from "@/components/newsletter/template-manager";
import { TemplateStatusBadge } from "@/components/newsletter/status-badge";
import { serverFetchNewsletterTemplates } from "@/lib/newsletter.api";

export const metadata: Metadata = { title: "Newsletter templates" };

type TemplatesSearchParams = {
  search?: string;
  status?: string;
  page?: string;
};

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<TemplatesSearchParams> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = 20;
  const search = params.search?.trim();
  const status = params.status?.trim();

  const data = await serverFetchNewsletterTemplates({ page, limit, search, status });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Newsletter templates"
        description="Reusable shells for recurring sends. Publishing a template makes it available to every campaign."
      />

      <TemplateManager />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search template name or subject..." className="w-full max-w-sm" />
        {(search || status) && (
          <p className="text-xs text-muted-foreground">
            {data.meta.total} template{data.meta.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Template</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 text-right font-medium">Used</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No templates yet. Create one to standardise recurring sends.
                    </td>
                  </tr>
                )}
                {data.items.map((template) => (
                  <tr key={template.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{template.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <TemplateStatusBadge status={template.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{template.category ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                      {template.usageCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(template.updatedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TemplateManager compact templateId={template.id} currentStatus={template.status} />
                    </td>
                  </tr>
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
