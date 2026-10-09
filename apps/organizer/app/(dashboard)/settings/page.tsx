import serverApi from "@/lib/apis/server-auth-api";
import { getCurrentOrganization } from "@/lib/organization/current-organization";
import { redirect } from "next/navigation";
import { SettingsHeader } from "./_components/settings-header";
import { OrgProfileCard } from "./_components/org-profile-card";
import { OrgContactCard } from "./_components/org-contact-card";
import { OrgPricingEligibilityCard } from "./_components/org-pricing-eligibility-card";
import { OrgBankDetailsCard } from "./_components/org-bank-details-card";
import { OrgDangerCard } from "./_components/org-danger-card";
import type { OrganizationBankAccountResponse, OrganizationPricingEligibilityResponse } from "@orgatick/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Settings | Orgatick",
  description: "Manage organization profile, contacts, bank details, and configuration.",
};

export default async function OrganizationSettingsPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) {
    redirect("/create");
  }

  const org = membership.organization;
  const roleKey = membership.role?.key?.toLowerCase();
  const isOwner = roleKey === "owner";
  const isOwnerOrAdmin = roleKey === "owner" || roleKey === "admin";

  let eligibility: OrganizationPricingEligibilityResponse | null = null;
  let bankAccount: OrganizationBankAccountResponse | null = null;

  try {
    const [eligibilityRes, bankRes] = await Promise.all([
      api.get(`/organizations/${org.id}/pricing-eligibility`),
      api.get(`/organizations/${org.id}/bank-account`).catch(() => null),
    ]);
    eligibility = eligibilityRes?.data?.data ?? null;
    bankAccount = bankRes?.data?.data ?? null;
  } catch {
    eligibility = null;
    bankAccount = null;
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <SettingsHeader
        orgName={org.name}
        slug={org.slug}
        status={org.status}
        verificationStatus={org.verification?.status}
      />

      <div className="grid grid-cols-1 gap-6">
        <OrgPricingEligibilityCard eligibility={eligibility} />

        <OrgBankDetailsCard
          organizationId={String(org.id)}
          initialAccount={bankAccount}
          isOwnerOrAdmin={isOwnerOrAdmin}
        />

        <OrgProfileCard organizationId={String(org.id)} initialName={org.name} initialDescription={org.description} />

        <OrgContactCard organizationId={String(org.id)} initialEmail={org.email} initialPhone={org.phoneNumber} />

        <OrgDangerCard isOwner={isOwner} />
      </div>
    </div>
  );
}
