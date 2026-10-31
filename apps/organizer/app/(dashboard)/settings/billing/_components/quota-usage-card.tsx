"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Badge } from "@orgatick/ui/components/badge";
import { Progress } from "@orgatick/ui/components/progress";
import { IconCheck, IconInfinity, IconX } from "@tabler/icons-react";
import type { OrganizationEffectiveEntitlements } from "@orgatick/contracts";

interface QuotaUsageCardProps {
  entitlements: OrganizationEffectiveEntitlements | null;
}

export function QuotaUsageCard({ entitlements }: QuotaUsageCardProps) {
  if (!entitlements) return null;

  const limits = Object.values(entitlements.limits);
  const features = Object.values(entitlements.features);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Quotas & Limits */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Resource Quotas & Usage</CardTitle>
          <p className="text-xs text-muted-foreground">
            Live consumption tracked against your organization&apos;s current plan limits.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {limits.map((lim) => {
            const percent = lim.percentageUsed ?? 0;
            const isHigh = percent >= 85;
            const isNearMax = percent >= 95;

            return (
              <div key={lim.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{lim.name}</span>
                  {lim.isUnlimited ? (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      <IconInfinity className="size-3" /> Unlimited
                    </Badge>
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      <strong className="text-foreground">{lim.currentUsage}</strong> / {lim.limitValue ?? "0"}{" "}
                      {lim.unit}
                    </span>
                  )}
                </div>
                {!lim.isUnlimited && (
                  <Progress
                    value={percent}
                    className={`h-2 ${isNearMax ? "[&>div]:bg-destructive" : isHigh ? "[&>div]:bg-amber-500" : ""}`}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Included Features</CardTitle>
          <p className="text-xs text-muted-foreground">
            Features currently enabled for your organization based on your tier and add-ons.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feat) => (
              <div key={feat.code} className="flex items-center gap-2 rounded-lg border border-border/40 p-2 text-xs">
                {feat.isIncluded ? (
                  <IconCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <IconX className="size-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={feat.isIncluded ? "font-medium text-foreground" : "text-muted-foreground line-through"}
                >
                  {feat.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
