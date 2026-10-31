import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { serverFetchFeatures, serverFetchLimitDefinitions, serverFetchSubscriptionPlans } from "@/lib/subscription.api";
import { AdminSubscriptionTabs } from "./_components/admin-subscription-tabs";

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
      <PageHeader
        title="Subscription Plans & Entitlements"
        description="Manage configurable subscription tiers, quotas, feature flags, and administrative tenant overrides."
      />

      <AdminSubscriptionTabs plans={plans} features={features} limits={limits} />
    </div>
  );
}
