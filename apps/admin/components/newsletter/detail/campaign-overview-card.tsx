import type { NewsletterOverview, NewsletterResponse } from "@orgatick/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconLink, IconUserMinus } from "@tabler/icons-react";
import { CampaignStatusBadge } from "@/components/newsletter/status-badge";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-foreground">{value}</dd>
    </div>
  );
}

function ReportRow({ label, value, icon: Icon }: { label: string; value: number; icon?: typeof IconUserMinus }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function formatTimestamp(value?: Date | string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CampaignOverviewCard({
  campaign,
  overview,
}: {
  campaign: NewsletterResponse;
  overview: NewsletterOverview;
}) {
  const { stats } = overview;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <span className="text-xs text-muted-foreground">
              Created {formatTimestamp(campaign.createdAt)}
              {campaign.createdByName ? ` by ${campaign.createdByName}` : ""}
            </span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Internal name" value={campaign.name} />
            <Detail label="Preview text" value={campaign.previewText ?? "Not set"} />
            <Detail label="Scheduled for" value={formatTimestamp(campaign.scheduledAt)} />
            <Detail label="Sent at" value={formatTimestamp(campaign.sentAt)} />
            <Detail label="Reply-to" value={campaign.replyTo ?? campaign.fromEmail} />
            <Detail label="Template" value={campaign.templateName ?? "Custom content"} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Deliverability Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ReportRow label="Sent" value={stats.sentCount} />
          <ReportRow label="Bounced" value={stats.bouncedCount} />
          <ReportRow label="Complaints" value={stats.complainedCount} />
          <ReportRow label="Unsubscribed" value={stats.unsubscribedCount} icon={IconUserMinus} />
          <ReportRow label="Failed" value={stats.failedCount} />

          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Links Clicked</p>
            {overview.topLinks.length === 0 && <p className="text-xs text-muted-foreground">No clicks recorded yet.</p>}
            {overview.topLinks.slice(0, 4).map((link) => (
              <p key={link.url} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <IconLink className="mt-0.5 size-3 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{link.url}</span>
                <span className="tabular-nums font-medium text-foreground">{link.count}</span>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
