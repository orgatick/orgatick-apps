import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { serverFetchOwnershipDisputeDetail } from "@/lib/admin.api";
import type { DisputeStatus, OwnershipDisputeRef } from "@/lib/types";
import { DisputeDetailActions } from "./_components/dispute-detail-actions";

export const metadata: Metadata = { title: "Ownership Dispute Detail" };

const statusBadgeClass: Record<DisputeStatus, string> = {
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

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let dispute: OwnershipDisputeRef | undefined;
  try {
    dispute = await serverFetchOwnershipDisputeDetail(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <Link
        href="/disputes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="size-4" /> Back to disputes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Dispute <span className="font-mono text-xl text-muted-foreground">#{dispute.id}</span>
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className={`px-1.5 py-0 font-mono text-[9px] capitalize ${statusBadgeClass[dispute.status]}`}
            >
              {dispute.status}
            </Badge>
            {dispute.freezeOwnership && (
              <Badge variant="destructive" className="px-1.5 py-0 font-mono text-[9px]">
                ownership frozen
              </Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{dispute.reason}</p>

              {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Evidence</p>
                  <ul className="space-y-1">
                    {dispute.evidenceUrls.map((url) => (
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

              {dispute.resolution && (
                <div className="mt-4 space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Outcome
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{dispute.resolution}</p>
                  {dispute.resolver && (
                    <p className="text-xs text-muted-foreground">
                      {dispute.status === "rejected" ? "Rejected" : "Resolved"} by {dispute.resolver.name} on{" "}
                      {dispute.resolvedAt
                        ? new Date(dispute.resolvedAt).toLocaleDateString(undefined, {
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
                  {dispute.organization ? (
                    <Link
                      href={`/organizations/${dispute.organizationId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {dispute.organization.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground/60">Deleted</span>
                  )}
                </MetaField>
                <MetaField label="Disputant">
                  <span className="text-sm text-foreground">{dispute.disputant?.name ?? "Member"}</span>
                </MetaField>
                <MetaField label="Current owner">
                  <span className="text-sm text-foreground">
                    {dispute.currentOwner?.name ?? dispute.organization?.creator?.name ?? "-"}
                  </span>
                </MetaField>
                <MetaField label="Filed at">{dateTime(dispute.createdAt)}</MetaField>
                <MetaField label="Last updated">{dateTime(dispute.updatedAt)}</MetaField>
                <MetaField label="Assignee">
                  <span className="text-sm text-foreground">{dispute.resolver?.name ?? "Unassigned"}</span>
                </MetaField>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <DisputeDetailActions dispute={dispute} />
        </aside>
      </div>
    </div>
  );
}
