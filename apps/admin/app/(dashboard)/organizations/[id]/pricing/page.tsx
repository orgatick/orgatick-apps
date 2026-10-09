import type { Metadata } from "next";
import { getOrganizationOr404 } from "@/lib/server-org";
import {
  serverFetchOrganizationPricing,
  serverFetchOrganizationBankAccount,
  serverFetchOrganizationCommission,
} from "@/lib/admin.api";
import type {
  AdminBankAccount,
  OrganizationPricingEligibility,
  OrganizationPricingSetting,
  OrganizationCommissionSetting,
} from "@/lib/types";
import { PricingPanel } from "./_components/pricing-panel";

export const metadata: Metadata = {
  title: "Organization Pricing Controls | Admin",
  description: "Configure paid event creation permissions and mandatory bank details requirement.",
};

export default async function OrganizationPricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await getOrganizationOr404(id);

  let initialData: { setting: OrganizationPricingSetting; eligibility: OrganizationPricingEligibility };
  let initialBankAccount: AdminBankAccount | null = null;
  let initialCommission: OrganizationCommissionSetting | null = null;

  try {
    const [pricingData, bankAccountData, commissionData] = await Promise.all([
      serverFetchOrganizationPricing(id),
      serverFetchOrganizationBankAccount(id).catch(() => null),
      serverFetchOrganizationCommission(id).catch(() => null),
    ]);
    initialData = pricingData;
    initialBankAccount = bankAccountData;
    initialCommission = commissionData;
  } catch {
    initialData = {
      setting: {
        organizationId: id,
        paidEventsEnabled: Boolean(organization.allowPaidEvents),
        requireBankDetails: true,
        disabledReason: null,
        updatedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      eligibility: {
        organizationId: id,
        paidEventsEnabled: Boolean(organization.allowPaidEvents),
        requireBankDetails: true,
        bankDetailsVerified: false,
        eligibleForPaidEvents: false,
        reasons: ["Organization must add and verify bank details before creating or publishing paid events."],
      },
    };
    initialBankAccount = null;
  }

  return (
    <PricingPanel
      organization={organization}
      initialSetting={initialData.setting}
      initialEligibility={initialData.eligibility}
      initialBankAccount={initialBankAccount}
      initialCommission={initialCommission}
    />
  );
}
