import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { serverFetchReportDetail } from "@/lib/admin.api";
import type { OrganizationReportRef, ReportStatus } from "@/lib/types";
import { ReportDetailActions } from "./_components/report-detail-actions";

export const metadata: Metadata = { title: "Report Detail" };

const statusBadgeClass: Record<ReportStatus, string> = {
  open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  investigating: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-muted text-muted-foreground",
};

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function dateTime(value?: string | null) {
  if (!value) return <span className="text-sm text-muted-foreground/60">-</span>;
  return (
    <span className="text-sm text-foreground">
      {new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let report: OrganizationReportRef | undefined;
  try {
    report = await serverFetchReportDetail(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="size-4" /> Back to reports
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Report <span className="font-mono text-xl text-muted-foreground">#{report.id}</span>
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className={`px-1.5 py-0 font-mono text-[9px] capitalize ${statusBadgeClass[report.status]}`}
            >
              {report.status}
            </Badge>
            <span className="font-mono text-xs capitalize">{report.category.replaceAll("_", " ")}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{report.description}</p>

              {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Evidence</p>
                  <ul className="space-y-1">
                    {report.evidenceUrls.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-primary hover:underline"
                        >
                          {url} <IconExternalLink className="size-3 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.status === "resolved" && report.resolution && (
                <div className="mt-4 space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Resolution
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{report.resolution}</p>
                  {report.resolver && (
                    <p className="text-xs text-muted-foreground">
                      Resolved by {report.resolver.name} on{" "}
                      {report.resolvedAt
                        ? new Date(report.resolvedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  )}
                </div>
              )}
              {report.status === "rejected" && (
                <div className="mt-4 space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-destructive">Rejected</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{report.resolution}</p>
                  {report.resolver && (
                    <p className="text-xs text-muted-foreground">
                      Rejected by {report.resolver.name} on{" "}
                      {report.resolvedAt
                        ? new Date(report.resolvedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <MetaField label="Organization">
                  {report.organization ? (
                    <Link
                      href={`/organizations/${report.organizationId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {report.organization.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground/60">Deleted</span>
                  )}
                </MetaField>
                <MetaField label="Filed by">
                  <span className="text-sm text-foreground">{report.reporter?.name ?? "Anonymous"}</span>
                </MetaField>
                <MetaField label="Filed at">{dateTime(report.createdAt)}</MetaField>
                <MetaField label="Last updated">{dateTime(report.updatedAt)}</MetaField>
                <MetaField label="Assignee">
                  <span className="text-sm text-foreground">{report.resolver?.name ?? "Unassigned"}</span>
                </MetaField>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <ReportDetailActions report={report} />
        </aside>
      </div>
    </div>
  );
}
