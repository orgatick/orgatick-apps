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
import { SubscriptionTabsView } from "./_components/subscription-tabs-view";

export const metadata: Metadata = {
  title: "Subscription & Plans | Orgatick",
  description: "Manage organization subscription plan, resource quotas, and billing invoices.",
};

export default async function OrganizationSubscriptionPage() {
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
    <SubscriptionTabsView
      organizationName={membership.organization.name}
      subscription={subscription}
      entitlements={entitlements}
      plans={plans}
      invoices={invoices}
    />
  );
}
