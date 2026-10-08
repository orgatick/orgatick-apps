import type { NewsletterStats } from "@orgatick/contracts";
import { IconChartBar, IconEye, IconMailForward, IconMailbox } from "@tabler/icons-react";
import { StatCard } from "@/components/stat-card";
import { formatPercent } from "@/lib/newsletter.api";

export function CampaignMetricsSection({ stats }: { stats: NewsletterStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Recipients"
        value={stats.recipientCount}
        hint={`${stats.sentCount} sent`}
        icon={IconMailbox}
        accent="primary"
      />
      <StatCard
        label="Delivered"
        value={stats.deliveredCount}
        hint={`${formatPercent(stats.bounceRate)} bounced`}
        icon={IconMailForward}
        accent="success"
      />
      <StatCard
        label="Open rate"
        value={formatPercent(stats.openRate)}
        hint={`${stats.openedCount} unique opens`}
        icon={IconEye}
      />
      <StatCard
        label="Click rate"
        value={formatPercent(stats.clickRate)}
        hint={`${stats.clickedCount} clicked`}
        icon={IconChartBar}
      />
    </div>
  );
}
