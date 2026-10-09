import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import type { AdminOrganization } from "@/lib/types";
import { AccessSummary, StatsGrid } from "./overview-access-and-stats";

interface OverviewSectionsProps {
  organization: AdminOrganization;
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "-"}</dd>
    </div>
  );
}

export function OverviewSections({ organization }: OverviewSectionsProps) {
  const verification = organization.verification;
  const address = organization.address;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">Access status</h3>
        <p className="text-sm text-muted-foreground">Current moderation state of the organization.</p>
      </div>
      <AccessSummary organization={organization} />

      <StatsGrid organization={organization} />

      {organization.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{organization.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Category" value={organization.category?.name ?? null} />
          <DetailItem label="Sub-category" value={organization.subCategory?.name ?? null} />
          <DetailItem label="Email" value={organization.email} />
          <DetailItem label="Phone" value={organization.phoneNumber} />
          <DetailItem
            label="Paid Events"
            value={
              organization.allowPaidEvents == null ? null : organization.allowPaidEvents ? "Allowed" : "Not allowed"
            }
          />
          <DetailItem
            label="Bank Requirement"
            value={
              organization.pricingSetting
                ? organization.pricingSetting.requireBankDetails
                  ? "Mandatory"
                  : "Optional"
                : "Mandatory"
            }
          />
          <DetailItem
            label="Created"
            value={
              organization.createdAt
                ? new Date(organization.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Status" value={verification?.status ?? null} />
          <DetailItem
            label="Verified At"
            value={
              verification?.status === "verified" && verification.verifiedAt
                ? new Date(verification.verifiedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not verified"
            }
          />
          <div className="sm:col-span-2">
            <DetailItem label="Rejection Reason" value={verification?.rejectionReason ?? null} />
          </div>
        </CardContent>
      </Card>

      {address && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Line 1" value={address.addressLine1} />
            <DetailItem label="Line 2" value={address.addressLine2} />
            <DetailItem label="Landmark" value={address.landmark} />
            <DetailItem label="Postal Code" value={address.postalCode} />
            <DetailItem
              label="City"
              value={
                address.city?.name
                  ? `${address.city.name}${address.division?.name ? `, ${address.division.name}` : ""}`
                  : null
              }
            />
            <DetailItem label="Country" value={address.country?.name ?? null} />
            <div className="lg:col-span-2">
              <DetailItem label="Formatted" value={address.formattedAddress} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
