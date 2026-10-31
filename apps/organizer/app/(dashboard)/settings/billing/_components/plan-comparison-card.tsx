"use client";

import { useState } from "react";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import {
  type ActiveSubscriptionDetail,
  type OrganizerSubscriptionPlan,
  type OrganizerSubscriptionPrice,
} from "@/lib/apis/subscription.api";
import { IconCheck, IconInfinity, IconX } from "@tabler/icons-react";
import { UpgradeDialog } from "./upgrade-dialog";

interface PlanComparisonCardProps {
  plans: OrganizerSubscriptionPlan[];
  currentSubscription: ActiveSubscriptionDetail | null;
}

function formatPrice(minorUnits?: string, currency = "INR"): string {
  if (!minorUnits) return "Free";
  const amount = Number(minorUnits) / 100;
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanComparisonCard({ plans, currentSubscription }: PlanComparisonCardProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<OrganizerSubscriptionPlan | null>(null);
  const [targetPrice, setTargetPrice] = useState<OrganizerSubscriptionPrice | null>(null);

  const currentTier = currentSubscription?.plan?.tierLevel ?? 0;

  const handleSelectPlan = (plan: OrganizerSubscriptionPlan) => {
    const selectedPrice = plan.prices?.find((p) => p.billingInterval === interval) || plan.prices?.[0];
    if (!selectedPrice) return;

    setTargetPlan(plan);
    setTargetPrice(selectedPrice);
    setUpgradeDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Available Subscription Plans</h3>
          <p className="text-xs text-muted-foreground">
            Upgrade anytime with prorated credit adjustments. Downgrades take effect at billing cycle end.
          </p>
        </div>

        {/* Interval toggle */}
        <div className="flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              interval === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              interval === "year"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Yearly</span>
            <Badge variant="default" className="text-[9px] px-1 py-0 bg-emerald-600 text-white">
              Save ~17%
            </Badge>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = plan.prices?.find((p) => p.billingInterval === interval) || plan.prices?.[0];
          const isCurrent = currentSubscription?.planId === plan.id;
          const isUpgrade = plan.tierLevel > currentTier;
          const isDowngrade = plan.tierLevel < currentTier;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between border-border/60 bg-card transition-all ${
                isCurrent ? "ring-2 ring-primary border-primary shadow-sm" : "hover:border-primary/40"
              }`}
            >
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={isCurrent ? "default" : "secondary"} className="font-mono text-xs uppercase">
                    {plan.code}
                  </Badge>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[10px] text-primary border-primary">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="font-mono text-2xl font-black text-foreground">
                    {price ? formatPrice(price.priceInMinorUnits, price.currency) : "Free"}
                  </span>
                  {price && price.priceInMinorUnits !== "0" && (
                    <span className="text-xs text-muted-foreground">/{interval}</span>
                  )}
                </div>
                {plan.description && <p className="text-xs text-muted-foreground min-h-[36px]">{plan.description}</p>}
              </CardHeader>

              <CardContent className="space-y-6 pt-0">
                {/* Limits */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <h5 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Limits</h5>
                  <div className="space-y-1.5 text-xs">
                    {plan.limits?.map((lim) => (
                      <div key={lim.id} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{lim.limitDefinition.name}</span>
                        {lim.isUnlimited ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                          >
                            <IconInfinity className="size-3" /> Unlimited
                          </Badge>
                        ) : (
                          <span className="font-mono font-medium text-foreground">{lim.limitValue ?? "0"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <h5 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Features</h5>
                  <div className="space-y-1 text-xs">
                    {plan.features?.map((feat) => (
                      <div key={feat.id} className="flex items-center gap-2 py-0.5">
                        {feat.isIncluded ? (
                          <IconCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <IconX className="size-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={feat.isIncluded ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                          {feat.feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full text-xs">
                      Active Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      variant="default"
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full text-xs font-semibold"
                    >
                      Upgrade Plan
                    </Button>
                  ) : isDowngrade ? (
                    <Button variant="secondary" onClick={() => handleSelectPlan(plan)} className="w-full text-xs">
                      Downgrade
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full text-xs">
                      Select
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        targetPlan={targetPlan}
        targetPrice={targetPrice}
      />
    </div>
  );
}
