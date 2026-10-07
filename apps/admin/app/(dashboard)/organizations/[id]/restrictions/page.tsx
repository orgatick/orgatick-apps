import type { Metadata } from "next";
import { getOrganizationOr404 } from "@/lib/server-org";
import { RestrictionsPanel } from "./_components/restrictions-panel";

export const metadata: Metadata = { title: "Organization Restrictions" };

export default async function OrganizationRestrictionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await getOrganizationOr404(id);

  return <RestrictionsPanel organization={organization} />;
}
