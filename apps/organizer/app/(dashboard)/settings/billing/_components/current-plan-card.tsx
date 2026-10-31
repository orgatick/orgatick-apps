"use client";

import { useState } from "react";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { cancelSubscription, type ActiveSubscriptionDetail } from "@/lib/apis/subscription.api";
import { toast } from "sonner";
import { IconAlertTriangle, IconCalendar, IconCheck, IconRotateClockwise } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface CurrentPlanCardProps {
  subscription: ActiveSubscriptionDetail | null;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Perpetual";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);

  if (!subscription) return null;

  const handleCancelAutoRenew = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel auto-renewal? Your subscription will remain active until the end of the billing period.",
      )
    ) {
      return;
    }

    try {
      setCanceling(true);
      await cancelSubscription("Organizer requested non-renewal");
      toast.success("Auto-renewal has been canceled. Your plan will expire at the end of the period.");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to cancel renewal";
      toast.error(errorMsg || "Failed to cancel renewal");
    } finally {
      setCanceling(false);
    }
  };

  const isFree = subscription.billingInterval === "none" || subscription.plan.code === "free";

  return (
    <Card className="border-border/60 bg-card overflow-hidden">
      <div className="bg-primary/5 border-b border-border/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs uppercase font-mono">
            Current Subscription
          </Badge>
          <span className="text-xs text-muted-foreground">Tenant Billing Status</span>
        </div>
        <Badge
          variant={
            subscription.status === "active"
              ? "outline"
              : subscription.status === "past_due"
                ? "destructive"
                : "secondary"
          }
          className="capitalize font-medium"
        >
          {subscription.status.replace("_", " ")}
        </Badge>
      </div>

      <CardHeader className="pb-4 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{subscription.plan.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {subscription.plan.description || "Active organization subscription package"}
            </p>
          </div>
          <div className="flex items-baseline gap-1 font-mono text-xl font-bold">
            {isFree ? (
              <span>Free Forever</span>
            ) : (
              <>
                <span>
                  {subscription.price
                    ? `₹${(Number(subscription.price.priceInMinorUnits) / 100).toLocaleString("en-IN")}`
                    : "Paid"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">/{subscription.billingInterval}</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg bg-muted/30 p-4 border border-border/40 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <IconCalendar className="size-3.5" /> Billing Interval
            </span>
            <span className="font-semibold capitalize text-foreground">
              {subscription.billingInterval === "none" ? "Ongoing / Lifetime" : subscription.billingInterval}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <IconRotateClockwise className="size-3.5" /> Current Period
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <IconCheck className="size-3.5" /> Renewal Status
            </span>
            <span className="font-semibold text-foreground">
              {subscription.cancelAtPeriodEnd ? (
                <span className="text-amber-600 dark:text-amber-400">Cancels at Period End</span>
              ) : subscription.autoRenew ? (
                <span className="text-emerald-600 dark:text-emerald-400">Auto-renews automatically</span>
              ) : (
                "Manual Renewal"
              )}
            </span>
          </div>
        </div>

        {/* Notices */}
        {subscription.cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <IconAlertTriangle className="size-4 shrink-0" />
            <span>
              Your subscription is set to cancel on <strong>{formatDate(subscription.currentPeriodEnd)}</strong>. You
              will automatically revert to the Free tier with no event data loss.
            </span>
          </div>
        )}

        {subscription.pendingPlan && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
            <IconRotateClockwise className="size-4 shrink-0" />
            <span>
              A scheduled downgrade to <strong>{subscription.pendingPlan.name}</strong> will take effect on{" "}
              <strong>{formatDate(subscription.pendingChangeEffectiveAt)}</strong>.
            </span>
          </div>
        )}

        {/* Actions */}
        {!isFree && !subscription.cancelAtPeriodEnd && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelAutoRenew}
              disabled={canceling}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              {canceling ? "Canceling..." : "Cancel Auto-Renewal"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
