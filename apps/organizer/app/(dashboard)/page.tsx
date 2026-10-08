import serverApi from "@/lib/apis/server-auth-api";
import { getCurrentOrganization, getVerificationStatus } from "@/lib/organization/current-organization";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { redirect } from "next/navigation";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardOverviewCards } from "./_components/dashboard-overview-cards";
import { DashboardQuickActions } from "./_components/dashboard-quick-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Overview | Orgatick",
  description: "View and manage your organization details, team, and verification status.",
};

export default async function DashboardPage() {
  const api = await serverApi();

  const membership = await getCurrentOrganization(api);
  if (!membership) {
    redirect("/create");
  }

  const org = membership.organization;
  const isVerified = getVerificationStatus(membership) === OrganizationVerificationStatus.VERIFIED;

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <DashboardHeader orgName={org.name} roleName={membership.role.name} isVerified={isVerified} />

      <DashboardOverviewCards categoryName={org.category?.name} email={org.email} isVerified={isVerified} />

      <div className="space-y-3 pt-2">
        <h2 className="font-heading text-lg font-semibold text-foreground">Management & Workflows</h2>
        <DashboardQuickActions />
      </div>
    </div>
  );
}
