import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import serverApi from "@/lib/apis/server-auth-api";
import { getCurrentOrganization, getVerificationStatus } from "@/lib/organization/current-organization";
import { OrganizationReadinessCard } from "./_components/organization-readiness-card";
import { OrganizationReviewCard } from "./_components/organization-review-card";
import { RaiseVerificationButton } from "./_components/raise-verification-button";
import { VerificationFaqCard } from "./_components/verification-faq-card";
import { VerificationHeader } from "./_components/verification-header";
import { VerificationHeroBanner } from "./_components/verification-hero-banner";
import { VerificationPerksCard } from "./_components/verification-perks-card";
import { VerificationStepper } from "./_components/verification-stepper";

export const metadata: Metadata = {
  title: "Organization Verification | Orgatick Organizer",
  description: "Verify your organization to unlock events, payouts, and full marketplace capabilities.",
};

export default async function VerificationPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) redirect("/");

  const organization = membership.organization;
  const status = getVerificationStatus(membership);
  const verification = organization.verification ?? null;
  const roleKey = membership.role?.key?.toLowerCase();
  const canSubmit = roleKey === "owner" || roleKey === "admin" || !roleKey;
  const canRequest = status !== OrganizationVerificationStatus.VERIFIED;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      {/* Header with Title and Primary Action */}
      <VerificationHeader
        organizationId={organization.id}
        organizationName={organization.name}
        status={status}
        canSubmit={canSubmit}
        roleName={membership.role?.name}
      />

      {/* 3-Step Verification Pipeline Stepper */}
      <VerificationStepper status={status} />

      {/* Main Hero Status Billboard */}
      <VerificationHeroBanner
        organizationId={organization.id}
        organizationName={organization.name}
        status={status}
        rejectionReason={verification?.rejectionReason ?? null}
        verifiedAt={verification?.verifiedAt ?? null}
        canSubmit={canSubmit}
        roleName={membership.role?.name}
      />

      {/* 2-Column Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          <OrganizationReadinessCard organization={organization} />
          <VerificationPerksCard />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 lg:col-span-1">
          <OrganizationReviewCard membership={membership} />
          <VerificationFaqCard />
        </div>
      </div>

      {/* Bottom Sticky-Ready Action Bar */}
      {canRequest && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/80 p-4 shadow-xs backdrop-blur-sm sm:p-5">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {status === OrganizationVerificationStatus.REJECTED
                ? "Ready to resubmit with updated details?"
                : "Ready to start selling tickets and receiving payouts?"}
            </p>
            <p className="text-xs text-muted-foreground">
              Our compliance specialists review submitted organizations in 1 to 2 business days.
            </p>
          </div>

          <RaiseVerificationButton
            organizationId={organization.id}
            organizationName={organization.name}
            isResubmission={status === OrganizationVerificationStatus.REJECTED}
            canSubmit={canSubmit}
            roleName={membership.role?.name}
          />
        </div>
      )}
    </div>
  );
}
