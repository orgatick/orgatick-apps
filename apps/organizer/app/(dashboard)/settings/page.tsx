import serverApi from "@/lib/apis/server-auth-api";
import { getCurrentOrganization } from "@/lib/organization/current-organization";
import { redirect } from "next/navigation";
import { SettingsHeader } from "./_components/settings-header";
import { OrgProfileCard } from "./_components/org-profile-card";
import { OrgContactCard } from "./_components/org-contact-card";
import { OrgDangerCard } from "./_components/org-danger-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Settings | Orgatick",
  description: "Manage organization profile, contacts, and configuration.",
};

export default async function OrganizationSettingsPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) {
    redirect("/create");
  }

  const org = membership.organization;
  const isOwner = membership.role.key === "OWNER" || membership.role.key === "owner";

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <SettingsHeader
        orgName={org.name}
        slug={org.slug}
        status={org.status}
        verificationStatus={org.verification?.status}
      />

      <div className="grid grid-cols-1 gap-6">
        <OrgProfileCard organizationId={String(org.id)} initialName={org.name} initialDescription={org.description} />

        <OrgContactCard organizationId={String(org.id)} initialEmail={org.email} initialPhone={org.phoneNumber} />

        <OrgDangerCard isOwner={isOwner} />
      </div>
    </div>
  );
}
