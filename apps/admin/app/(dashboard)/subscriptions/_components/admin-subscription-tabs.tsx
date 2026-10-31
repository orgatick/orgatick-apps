"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Badge } from "@orgatick/ui/components/badge";
import { IconGauge, IconListDetails, IconPackages, IconShieldLock } from "@tabler/icons-react";
import { PlanCard, type SubscriptionPlanView } from "./plan-card";
import { OverrideDialog } from "./override-dialog";
import { AssignTierDialog } from "./assign-tier-dialog";
import type { AdminCatalogFeature, AdminCatalogLimit } from "@/lib/subscription.api";

interface AdminSubscriptionTabsProps {
  plans: SubscriptionPlanView[];
  features: AdminCatalogFeature[];
  limits: AdminCatalogLimit[];
}

export function AdminSubscriptionTabs({ plans, features, limits }: AdminSubscriptionTabsProps) {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)}>
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="plans" className="gap-2 px-4 py-2 font-medium">
              <IconPackages className="size-4" />
              <span>Subscription Tiers ({plans.length})</span>
            </TabsTrigger>
            <TabsTrigger value="overrides" className="gap-2 px-4 py-2 font-medium">
              <IconShieldLock className="size-4" />
              <span>Entitlement Overrides</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2 px-4 py-2 font-medium">
              <IconListDetails className="size-4" />
              <span>Features & Limits Definitions</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <OverrideDialog features={features} limits={limits} />
          <AssignTierDialog plans={plans} />
        </div>
      </div>

      {/* Tab 1: Plans Catalog */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Entitlement Overrides Studio */}
      {activeTab === "overrides" && (
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organization Entitlement Overrides</CardTitle>
                <CardDescription>
                  Grant custom feature switches and higher quota ceilings to individual organizations. Overrides hold
                  highest precedence over base plans and purchased add-ons.
                </CardDescription>
              </div>
              <OverrideDialog features={features} limits={limits} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center space-y-3">
              <IconShieldLock className="size-10 mx-auto text-primary/70" />
              <div className="max-w-md mx-auto">
                <h4 className="font-semibold text-foreground">3-Tier Entitlement Precedence</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  1. Admin Override (Highest) &rarr; 2. Purchased Add-on &rarr; 3. Base Plan Tier (Baseline).
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the <strong>&ldquo;Grant Override&rdquo;</strong> button above to search for an organization and
                  configure custom limits or temporary sponsorships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Global Features & Limit Definitions */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconListDetails className="size-4 text-primary" />
                Global Feature Definitions ({features.length})
              </CardTitle>
              <CardDescription>Available boolean switches across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                {features.map((f) => (
                  <div key={f.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{f.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] capitalize">
                      {f.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconGauge className="size-4 text-primary" />
                Global Limit Definitions ({limits.length})
              </CardTitle>
              <CardDescription>Numerical resource quotas and metrics tracked per organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                {limits.map((l) => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{l.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{l.code}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {l.limitScope}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
