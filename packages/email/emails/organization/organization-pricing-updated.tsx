import { Heading, Link, Section, Text } from "react-email";
import { EmailAlert, EmailButton, EmailCard, EmailFooter, EmailHeader, EmailInfoRow, EmailLayout } from "../components";

export interface OrganizationPricingUpdatedEmailProps {
  recipientName?: string;
  organizationName?: string;
  paidEventsEnabled?: boolean;
  requireBankDetails?: boolean;
  disabledReason?: string | null;
  updatedByName?: string | null;
  dashboardUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const OrganizationPricingUpdatedEmail = ({
  recipientName = "Organizer",
  organizationName = "your organization",
  paidEventsEnabled = true,
  requireBankDetails = true,
  disabledReason,
  updatedByName,
  dashboardUrl = "https://dev.orgatick.site/settings",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: OrganizationPricingUpdatedEmailProps) => {
  const previewText = `Pricing and paid event controls updated for ${organizationName} on ${companyName}`;

  return (
    <EmailLayout previewText={previewText}>
      <EmailHeader companyName={companyName} />

      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Pricing Controls Updated
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hello <strong className="text-foreground">{recipientName}</strong>, the paid event and pricing settings for{" "}
          <strong className="text-foreground">{organizationName}</strong> have been updated by platform administration
          {updatedByName ? ` (${updatedByName})` : ""}.
        </Text>
      </Section>

      <Section className="px-8 pb-4">
        <EmailCard variant="outline" className="p-4 space-y-3">
          <EmailInfoRow label="Paid Events Status" value={paidEventsEnabled ? "Enabled" : "Disabled"} />
          <EmailInfoRow
            label="Bank Details Requirement"
            value={requireBankDetails ? "Mandatory for Paid Events" : "Optional"}
          />
          {disabledReason && <EmailInfoRow label="Admin Note / Reason" value={disabledReason} />}
        </EmailCard>
      </Section>

      {!paidEventsEnabled && disabledReason && (
        <Section className="px-8 pb-4">
          <EmailAlert type="warning" title="Paid Events Disabled">
            Reason: {disabledReason}. To appeal or resolve this restriction, please review your compliance documents or
            contact support.
          </EmailAlert>
        </Section>
      )}

      {paidEventsEnabled && requireBankDetails && (
        <Section className="px-8 pb-4">
          <EmailAlert type="info" title="Bank Verification Required">
            Please ensure your organization has uploaded and verified active bank account details before publishing paid
            events.
          </EmailAlert>
        </Section>
      )}

      <Section className="px-8 pb-6 text-center">
        <EmailButton href={dashboardUrl} variant="primary">
          View Organization Settings &rarr;
        </EmailButton>
      </Section>

      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Have questions regarding this update? Contact our compliance and payments team at{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
            .
          </Text>
        </EmailCard>
      </Section>

      <EmailFooter companyName={companyName} year={year} />
    </EmailLayout>
  );
};

OrganizationPricingUpdatedEmail.PreviewProps = {
  recipientName: "Aditi Rao",
  organizationName: "Tech Innovators Club",
  paidEventsEnabled: true,
  requireBankDetails: true,
  disabledReason: null,
  updatedByName: "Platform Administrator",
  dashboardUrl: "https://dev.orgatick.site/settings",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies OrganizationPricingUpdatedEmailProps;

export default OrganizationPricingUpdatedEmail;
