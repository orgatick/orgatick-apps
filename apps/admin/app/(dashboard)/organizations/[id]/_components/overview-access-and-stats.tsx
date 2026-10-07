import { Badge } from "@orgatick/ui/components/badge";
import type { AdminOrganization } from "@/lib/types";

interface AccessAndStatsProps {
  organization: AdminOrganization;
}

export function AccessSummary({ organization }: AccessAndStatsProps) {
  const state = organization.adminState;
  const items = [
    { label: "Blocked", active: Boolean(state?.blocked), reason: state?.blockReason ?? null },
    { label: "Hidden", active: Boolean(state?.hidden), reason: state?.hiddenReason ?? null },
    { label: "Archived", active: Boolean(state?.archived), reason: state?.archivedReason ?? null },
    { label: "Closure requested", active: Boolean(state?.closureRequestedAt), reason: state?.closureReason ?? null },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border p-3 ${
            item.active ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
            {item.active && <Badge variant="destructive">active</Badge>}
          </div>
          <p className="mt-1 truncate text-sm text-foreground">{item.reason ?? (item.active ? "Yes" : "No")}</p>
        </div>
      ))}
    </div>
  );
}

export function StatsGrid({ organization }: AccessAndStatsProps) {
  if (!organization.stats) return null;
  const { totalEvents, totalParticipants, totalPaidRegistrations, totalRevenue } = organization.stats;
  const items = [
    { label: "Total Events", value: Number(totalEvents ?? 0) },
    { label: "Participants", value: Number(totalParticipants ?? 0) },
    { label: "Paid Registrations", value: Number(totalPaidRegistrations ?? 0) },
    {
      label: "Revenue",
      value: Number(totalRevenue ?? 0).toLocaleString(undefined, {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      }),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border/60 bg-card p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
