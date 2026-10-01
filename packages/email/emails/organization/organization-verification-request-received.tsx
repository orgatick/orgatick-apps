import { Heading, Link, Row, Section, Text } from "react-email";
import {
  EmailAlert,
  EmailButton,
  EmailCard,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailInfoRow,
  EmailLayout,
} from "../components";

export interface OrganizationVerificationRequestReceivedEmailProps {
  ownerName?: string;
  organizationName?: string;
  verificationReference?: string;
  submittedAt?: string;
  reviewTimeline?: string;
  dashboardUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const OrganizationVerificationRequestReceivedEmail = ({
  ownerName = "{{{ownerName}}}",
  organizationName = "{{{organizationName}}}",
  verificationReference = "{{{verificationReference}}}",
  submittedAt = "{{{submittedAt}}}",
  reviewTimeline = "24 hours",
  dashboardUrl = "{{{dashboardUrl}}}",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: OrganizationVerificationRequestReceivedEmailProps) => {
  const previewText = `We received your verification request for ${organizationName}. We'll respond within ${reviewTimeline}.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Confirmation Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Verification Request Received
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{ownerName}</strong>, we&apos;ve received your verification request for{" "}
          <strong className="text-foreground">{organizationName}</strong>. Our team is on it!
        </Text>
      </Section>

      {/* Request Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Request Details
          </Heading>
          <EmailInfoRow label="Organization" value={organizationName} />
          {submittedAt && <EmailInfoRow label="Submitted on" value={submittedAt} />}
          {verificationReference && <EmailInfoRow label="Reference" value={verificationReference} isMono />}
          <EmailInfoRow label="Review time" value={`Within ${reviewTimeline}`} />
        </EmailCard>
      </Section>

      {/* What Happens Next */}
      <Section className="px-8 pb-4">
        <EmailAlert type="info" title="What happens next?">
          We&apos;ll review your request using the information you provided and will try to respond within{" "}
          <strong className="text-foreground">{reviewTimeline}</strong> whether your organization is verified or not. No
          further action is needed on your end.
        </EmailAlert>
      </Section>

      {/* What Verification Unlocks */}
      <Section className="px-8">
        <Heading as="h2" className="text-[17px] font-bold text-foreground m-0 mb-3">
          Once verified, you can:
        </Heading>
        <Section className="mb-3">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                ✓
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">Create live events</Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Set up and manage live events for your organization.
              </Text>
            </td>
          </Row>
        </Section>
        <Section className="mb-3">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                ✓
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Publish events and go live
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Publish your events and go live whenever you&apos;re ready.
              </Text>
            </td>
          </Row>
        </Section>
        <Section>
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                ✓
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Sell free or paid tickets
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Offer tickets for free or set your own pricing for paid events.
              </Text>
            </td>
          </Row>
        </Section>
      </Section>

      {/* Track Status */}
      <Section className="px-8 pb-4 text-center pt-4">
        <EmailButton href={dashboardUrl} variant="primary">
          Track Verification Status &rarr;
        </EmailButton>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Questions about your request? Contact us at{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
          </Text>
        </EmailCard>
      </Section>

      {/* Footer */}
      <EmailFooter
        companyName={companyName}
        year={year}
        note={`This is a confirmation email for the verification request of ${organizationName} (${verificationReference}).`}
      />
    </EmailLayout>
  );
};

OrganizationVerificationRequestReceivedEmail.PreviewProps = {
  ownerName: "{{{ownerName}}}",
  organizationName: "{{{organizationName}}}",
  verificationReference: "{{{verificationReference}}}",
  submittedAt: "{{{submittedAt}}}",
  reviewTimeline: "24 hours",
  dashboardUrl: "{{{dashboardUrl}}}",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies OrganizationVerificationRequestReceivedEmailProps;

export default OrganizationVerificationRequestReceivedEmail;
