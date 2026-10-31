"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orgatick/ui/components/tabs";
import { Badge } from "@orgatick/ui/components/badge";
import { IconBuilding, IconFileInvoice, IconLayoutDashboard, IconShieldCheck, IconSparkles } from "@tabler/icons-react";
import type { OrganizationEffectiveEntitlements } from "@orgatick/contracts";
import type {
  ActiveSubscriptionDetail,
  OrganizerSubscriptionPlan,
  SubscriptionInvoiceView,
} from "@/lib/apis/subscription.api";
import { CurrentPlanCard } from "../../settings/billing/_components/current-plan-card";
import { QuotaUsageCard } from "../../settings/billing/_components/quota-usage-card";
import { PlanComparisonCard } from "../../settings/billing/_components/plan-comparison-card";
import { InvoicesTable } from "../../settings/billing/_components/invoices-table";

interface SubscriptionTabsViewProps {
  organizationName: string;
  subscription: ActiveSubscriptionDetail | null;
  entitlements: OrganizationEffectiveEntitlements | null;
  plans: OrganizerSubscriptionPlan[];
  invoices: SubscriptionInvoiceView[];
}

export function SubscriptionTabsView({
  organizationName,
  subscription,
  entitlements,
  plans,
  invoices,
}: SubscriptionTabsViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const planName = subscription?.plan?.name ?? "Free Tier";
  const status = subscription?.status ?? "active";
  const interval = subscription?.billingInterval ?? "perpetual";

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-12">
      {/* Top Banner & Organization Plan Context */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Organization Subscription
            </span>
            <Badge variant="outline" className="gap-1 font-mono text-[10px] uppercase text-primary border-primary/30">
              <IconBuilding className="size-3" />
              Per-Organization Scope
            </Badge>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {organizationName} &middot; {planName}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Subscription plans, quotas, and limits apply at the organization level. All active events, team members, and
            custom roles share this organization&apos;s allocated resources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize gap-1.5 py-1 px-3">
            <IconShieldCheck className="size-3.5" />
            <span>{status}</span>
          </Badge>
          <Badge variant="outline" className="font-mono text-xs uppercase px-2.5 py-1">
            {interval === "none" ? "Free" : interval === "month" ? "Monthly" : "Annual"}
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)} className="w-full space-y-6">
        <div className="border-b border-border/40 pb-2">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 px-4 py-2 font-medium">
              <IconLayoutDashboard className="size-4" />
              <span>Plan & Usage Quotas</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2 px-4 py-2 font-medium">
              <IconSparkles className="size-4" />
              <span>Explore Plans & Upgrade</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2 px-4 py-2 font-medium">
              <IconFileInvoice className="size-4" />
              <span>Billing & Invoices ({invoices.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview & Quotas */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <CurrentPlanCard subscription={subscription} />
          <QuotaUsageCard entitlements={entitlements} />
        </TabsContent>

        {/* Tab 2: Plans & Upgrade Matrix */}
        <TabsContent value="plans" className="space-y-6 outline-none">
          <PlanComparisonCard plans={plans} currentSubscription={subscription} />
        </TabsContent>

        {/* Tab 3: Billing & Invoices */}
        <TabsContent value="invoices" className="space-y-6 outline-none">
          <InvoicesTable invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
