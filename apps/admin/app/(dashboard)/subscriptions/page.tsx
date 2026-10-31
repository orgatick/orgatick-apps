import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { serverFetchFeatures, serverFetchLimitDefinitions, serverFetchSubscriptionPlans } from "@/lib/subscription.api";
import { AssignTierDialog } from "./_components/assign-tier-dialog";
import { OverrideDialog } from "./_components/override-dialog";
import { PlanCard, type SubscriptionPlanView } from "./_components/plan-card";

export const metadata: Metadata = {
  title: "Subscription Management",
};

export default async function SubscriptionsPage() {
  const [plans, features, limits] = await Promise.all([
    serverFetchSubscriptionPlans().catch(() => []),
    serverFetchFeatures().catch(() => []),
    serverFetchLimitDefinitions().catch(() => []),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Subscription Plans & Entitlements"
          description="Manage configurable subscription tiers, quotas, feature flags, and administrative tenant overrides."
        />
        <div className="flex items-center gap-3">
          <OverrideDialog features={features} limits={limits} />
          <AssignTierDialog plans={plans} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Configured Subscription Tiers</h3>
          <span className="text-sm text-muted-foreground">{plans.length} active plans</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan: SubscriptionPlanView) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
