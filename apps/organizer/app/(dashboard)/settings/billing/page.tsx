import type { Metadata } from "next";
import { redirect } from "next/navigation";
import serverApi from "@/lib/apis/server-auth-api";
import { getCurrentOrganization } from "@/lib/organization/current-organization";
import {
  serverFetchCurrentSubscription,
  serverFetchEffectiveEntitlements,
  serverFetchInvoices,
  serverFetchSubscriptionPlans,
} from "@/lib/apis/subscription.api";
import { CurrentPlanCard } from "./_components/current-plan-card";
import { QuotaUsageCard } from "./_components/quota-usage-card";
import { PlanComparisonCard } from "./_components/plan-comparison-card";
import { InvoicesTable } from "./_components/invoices-table";

export const metadata: Metadata = {
  title: "Subscription & Billing | Orgatick",
  description: "Manage organization subscription plan, numerical quotas, features, and billing receipts.",
};

export default async function BillingSettingsPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) {
    redirect("/create");
  }

  const [subscription, entitlements, plans, invoices] = await Promise.all([
    serverFetchCurrentSubscription().catch(() => null),
    serverFetchEffectiveEntitlements().catch(() => null),
    serverFetchSubscriptionPlans().catch(() => []),
    serverFetchInvoices().catch(() => []),
  ]);

  return (
    <div className="flex min-h-full w-full flex-col gap-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Plans</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization&apos;s subscription tier, usage quotas, and invoices.
        </p>
      </div>

      <CurrentPlanCard subscription={subscription} />

      <QuotaUsageCard entitlements={entitlements} />

      <PlanComparisonCard plans={plans} currentSubscription={subscription} />

      <InvoicesTable invoices={invoices} />
    </div>
  );
}
