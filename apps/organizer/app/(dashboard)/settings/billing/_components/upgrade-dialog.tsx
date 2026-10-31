"use client";

import { useEffect, useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orgatick/ui/components/dialog";
import {
  executeUpgrade,
  previewUpgrade,
  type OrganizerSubscriptionPlan,
  type OrganizerSubscriptionPrice,
} from "@/lib/apis/subscription.api";
import type { ProrationPreview } from "@orgatick/contracts";
import { toast } from "sonner";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan: OrganizerSubscriptionPlan | null;
  targetPrice: OrganizerSubscriptionPrice | null;
}

function formatPrice(minorUnits: string, currency = "INR"): string {
  const amount = Number(minorUnits) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function UpgradeDialog({ open, onOpenChange, targetPlan, targetPrice }: UpgradeDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<ProrationPreview | null>(null);

  useEffect(() => {
    if (open && targetPlan && targetPrice) {
      setLoading(true);
      previewUpgrade(targetPlan.id, targetPrice.id)
        .then((res) => setPreview(res))
        .catch((err) => {
          toast.error(err.response?.data?.message || "Failed to calculate proration preview");
          setPreview(null);
        })
        .finally(() => setLoading(false));
    } else {
      setPreview(null);
    }
  }, [open, targetPlan, targetPrice]);

  const handleConfirmUpgrade = async () => {
    if (!targetPlan || !targetPrice) return;

    try {
      setSubmitting(true);
      await executeUpgrade(targetPlan.id, targetPrice.id);
      toast.success(`Successfully upgraded to ${targetPlan.name}!`);
      onOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to upgrade subscription";
      toast.error(errorMsg || "Failed to upgrade subscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSparkles className="size-5 text-primary" />
            Upgrade to {targetPlan?.name}
          </DialogTitle>
          <DialogDescription>
            Review the prorated billing adjustment for upgrading during your active cycle.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Calculating proration and current period credits...
          </div>
        ) : preview ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Current Plan</span>
                <span className="font-semibold text-foreground">{preview.currentPlanName}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Target Plan</span>
                <span className="font-semibold text-foreground">{preview.targetPlanName}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Days Remaining in Period</span>
                <span className="font-mono text-foreground">
                  {preview.daysRemainingInPeriod} of {preview.totalDaysInPeriod} days
                </span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-card p-3 border border-border/80 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Plan Prorated Charge</span>
                <span className="font-medium text-foreground">
                  {formatPrice(preview.targetPlanProratedChargeMinorUnits, preview.currency)}
                </span>
              </div>
              {Number(preview.unusedCurrentCreditMinorUnits) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Less Unused Credit ({preview.currentPlanName})</span>
                  <span>-{formatPrice(preview.unusedCurrentCreditMinorUnits, preview.currency)}</span>
                </div>
              )}
              <div className="border-t border-border/60 pt-2 flex items-baseline justify-between text-sm font-bold">
                <span>Net Payable Today</span>
                <span className="text-primary text-base">
                  {formatPrice(preview.netPayableMinorUnits, preview.currency)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">Unable to load upgrade details.</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmUpgrade} disabled={loading || submitting || !preview} className="gap-2">
            {submitting ? "Processing..." : "Confirm & Upgrade"}
            <IconArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
