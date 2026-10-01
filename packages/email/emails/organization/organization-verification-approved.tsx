import { Heading, Img, Link, Row, Section, Text } from "react-email";
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

export interface OrganizationVerificationApprovedEmailProps {
  ownerName?: string;
  organizationName?: string;
  organizationSlug?: string;
  verifiedAt?: string;
  verificationReference?: string;
  managerName?: string;
  managerTitle?: string;
  managerEmail?: string;
  managerPhone?: string;
  managerPhotoUrl?: string;
  dashboardUrl?: string;
  onboardingUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const OrganizationVerificationApprovedEmail = ({
  ownerName = "{{{ownerName}}}",
  organizationName = "{{{organizationName}}}",
  organizationSlug = "{{{organizationSlug}}}",
  verifiedAt = "{{{verifiedAt}}}",
  verificationReference = "{{{verificationReference}}}",
  managerName = "{{{managerName}}}",
  managerTitle = "Relationship Manager",
  managerEmail = "{{{managerEmail}}}",
  managerPhone,
  managerPhotoUrl,
  dashboardUrl = "{{{dashboardUrl}}}",
  onboardingUrl = "{{{onboardingUrl}}}",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: OrganizationVerificationApprovedEmailProps) => {
  const previewText = `Great news! ${organizationName} has been successfully verified on ${companyName}.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Confirmation Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Your Organization is Verified!
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{ownerName}</strong>, great news!{" "}
          <strong className="text-foreground">{organizationName}</strong> has been successfully verified. You can now go
          live, publish events, and sell free or paid tickets.
        </Text>
      </Section>

      {/* Success Alert */}
      <Section className="px-8 pb-4">
        <EmailAlert type="success" title="You're ready to go live">
          Create live events, publish them, and start selling tickets — free or paid — right away.
        </EmailAlert>
      </Section>

      {/* Organization Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Organization Details
          </Heading>
          <EmailInfoRow label="Organization" value={organizationName} />
          {organizationSlug && <EmailInfoRow label="Slug" value={organizationSlug} isMono />}
          {verifiedAt && <EmailInfoRow label="Verified on" value={verifiedAt} />}
          {verificationReference && <EmailInfoRow label="Reference" value={verificationReference} isMono />}
        </EmailCard>
      </Section>

      {/* Relationship Manager Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="muted">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-foreground m-0 mb-3">
            Your dedicated Relationship Manager
          </Heading>
          <Text className="text-[14px] leading-[22px] text-muted-foreground m-0">
            We&apos;ve assigned <strong className="text-foreground">{managerName}</strong> as your dedicated
            relationship manager to guide you through the entire {companyName} experience — onboarding, live events,
            tickets, and more.
          </Text>
          <Section className="mt-4">
            <Row>
              <td className="w-[56px] align-top">
                {managerPhotoUrl ? (
                  <Img
                    src={managerPhotoUrl}
                    alt={`${managerName}'s profile photo`}
                    width="48"
                    height="48"
                    className="rounded-full block"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-accent-light text-primary font-bold text-[18px] flex items-center justify-center text-center block leading-12">
                    {managerName.charAt(0).toUpperCase()}
                  </span>
                )}
              </td>
              <td className="pl-3 align-top">
                <Text className="text-[15px] leading-[22px] text-foreground font-bold m-0">{managerName}</Text>
                <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">{managerTitle}</Text>
                {managerEmail && (
                  <Link href={`mailto:${managerEmail}`} className="text-primary underline font-medium text-[13px]">
                    {managerEmail}
                  </Link>
                )}
                {managerPhone && (
                  <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-1">{managerPhone}</Text>
                )}
              </td>
            </Row>
          </Section>
        </EmailCard>
      </Section>

      {/* Actions */}
      <Section className="px-8 pb-4 pt-4 text-center">
        <EmailButton href={dashboardUrl} variant="primary">
          Explore Your Workspace &rarr;
        </EmailButton>
        {onboardingUrl && (
          <EmailButton href={onboardingUrl} variant="outline">
            Book a Guided Walkthrough
          </EmailButton>
        )}
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Questions? Your relationship manager is here to help. You can also reach us at{" "}
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
        note={`This is a confirmation email for the verification of ${organizationName} (${verificationReference}).`}
      />
    </EmailLayout>
  );
};

OrganizationVerificationApprovedEmail.PreviewProps = {
  ownerName: "{{{ownerName}}}",
  organizationName: "{{{organizationName}}}",
  organizationSlug: "{{{organizationSlug}}}",
  verifiedAt: "{{{verifiedAt}}}",
  verificationReference: "{{{verificationReference}}}",
  managerName: "{{{managerName}}}",
  managerTitle: "Relationship Manager",
  managerEmail: "{{{managerEmail}}}",
  managerPhone: "{{{managerPhone}}}",
  managerPhotoUrl: "{{{managerPhotoUrl}}}",
  dashboardUrl: "{{{dashboardUrl}}}",
  onboardingUrl: "{{{onboardingUrl}}}",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies OrganizationVerificationApprovedEmailProps;

export default OrganizationVerificationApprovedEmail;
