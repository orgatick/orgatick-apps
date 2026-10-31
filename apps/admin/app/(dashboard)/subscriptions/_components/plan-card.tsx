"use client";

import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconCheck, IconInfinity, IconX } from "@tabler/icons-react";

interface PlanPrice {
  id: string;
  billingInterval: "month" | "year" | "none";
  priceInMinorUnits: string;
  currency: string;
}

interface PlanFeature {
  id: string;
  isIncluded: boolean;
  featureLevel?: string | null;
  feature: {
    code: string;
    name: string;
    category: string;
  };
}

interface PlanLimit {
  id: string;
  isUnlimited: boolean;
  limitValue?: string | null;
  limitDefinition: {
    code: string;
    name: string;
    limitScope: string;
    unit: string;
  };
}

export interface SubscriptionPlanView {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  tierLevel: number;
  isActive: boolean;
  isPublic: boolean;
  prices?: PlanPrice[];
  features?: PlanFeature[];
  limits?: PlanLimit[];
}

interface PlanCardProps {
  plan: SubscriptionPlanView;
}

function formatCurrency(minorUnits: string, currency = "INR"): string {
  const amount = Number(minorUnits) / 100;
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanCard({ plan }: PlanCardProps) {
  const monthlyPrice = plan.prices?.find((p) => p.billingInterval === "month");
  const yearlyPrice = plan.prices?.find((p) => p.billingInterval === "year");

  return (
    <Card className="flex flex-col justify-between border-border/60 bg-card hover:border-primary/40 transition-colors">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <Badge variant={plan.tierLevel === 0 ? "secondary" : "default"} className="font-mono text-xs uppercase">
            {plan.code}
          </Badge>
          <Badge variant={plan.isActive ? "outline" : "destructive"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
        {plan.description && <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>}
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <div className="rounded-lg bg-muted/40 p-3 space-y-1">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Monthly:</span>
            <span className="font-semibold text-foreground">
              {monthlyPrice ? `${formatCurrency(monthlyPrice.priceInMinorUnits, monthlyPrice.currency)}/mo` : "Free"}
            </span>
          </div>
          {yearlyPrice && (
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Yearly:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(yearlyPrice.priceInMinorUnits, yearlyPrice.currency)}/yr
              </span>
            </div>
          )}
        </div>

        {/* Numerical Limits */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan Limits</h4>
          <div className="space-y-1.5 text-xs">
            {plan.limits?.map((lim) => (
              <div
                key={lim.id}
                className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
              >
                <span className="text-foreground">{lim.limitDefinition.name}</span>
                {lim.isUnlimited ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    <IconInfinity className="size-3" /> Unlimited
                  </Badge>
                ) : (
                  <span className="font-mono font-medium text-foreground">
                    {lim.limitValue ?? "0"} {lim.limitDefinition.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Entitlements */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features</h4>
          <div className="space-y-1 text-xs">
            {plan.features?.map((feat) => (
              <div key={feat.id} className="flex items-center gap-2 py-0.5">
                {feat.isIncluded ? (
                  <IconCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <IconX className="size-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className={feat.isIncluded ? "text-foreground" : "text-muted-foreground/60 line-through"}>
                  {feat.feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
