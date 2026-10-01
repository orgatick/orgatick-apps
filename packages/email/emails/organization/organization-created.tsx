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

export interface OrganizationCreatedEmailProps {
  ownerName: string;
  organizationName: string;
  organizationSlug: string;
  dashboardUrl: string;
  verificationUrl: string;
}

export const OrganizationCreatedEmail = ({
  ownerName = "{{{ownerName}}}",
  organizationName = "{{{organizationName}}}",
  organizationSlug = "{{{organizationSlug}}}",
  dashboardUrl = "{{{dashboardUrl}}}",
  verificationUrl = "{{{verificationUrl}}}",
}: OrganizationCreatedEmailProps) => {
  const previewText = `Your ${organizationName} organization has been created successfully on Orgatick.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader />

      {/* Main Confirmation Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Organization Created Successfully
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{ownerName}</strong>, we&apos;re excited to let you know that{" "}
          <strong className="text-foreground">{organizationName}</strong> has been created successfully.
        </Text>
      </Section>

      {/* Organization Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Organization Details
          </Heading>
          <EmailInfoRow label="Organization" value={organizationName} />
          <EmailInfoRow label="Slug" value={organizationSlug} isMono />
          <EmailInfoRow label="Your role" value="Owner" />
          <EmailAlert type="warning" title="Action required: Get verified to go live" className="mt-4 mb-0">
            <strong className="text-foreground">{organizationName}</strong> has been created, but it&apos;s not live
            yet. Raise a verification request to go live, publish events, and sell free or paid tickets.
          </EmailAlert>
        </EmailCard>
      </Section>

      {/* Primary Action Button */}
      <Section className="px-8 pb-4 text-center">
        <EmailButton href={verificationUrl} variant="primary">
          Raise Verification Request &rarr;
        </EmailButton>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
          Prefer to explore first?{" "}
          <Link href={dashboardUrl} className="text-primary underline font-medium">
            Go to your workspace
          </Link>
          .
        </Text>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Getting Started Guide */}
      <Section className="px-8 py-2">
        <Heading as="h2" className="text-[17px] font-bold text-foreground m-0 mb-4">
          Recommended next steps:
        </Heading>

        <Section className="mb-3.5">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                1
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Raise your verification request
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Submit your organization details so our team can verify you to go live.
              </Text>
            </td>
          </Row>
        </Section>

        <Section className="mb-3.5">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                2
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                We review your request
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Our team reviews the information you provide and responds within 24 hours.
              </Text>
            </td>
          </Row>
        </Section>

        <Section>
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                3
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Go live and host events
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Once verified, create and publish live events and sell free or paid tickets.
              </Text>
            </td>
          </Row>
        </Section>
      </Section>

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Need help setting up? Contact us at{" "}
            <Link href={`mailto:support@orgatick.in`} className="text-primary underline font-medium">
              support@orgatick.in
            </Link>
          </Text>
        </EmailCard>
      </Section>

      {/* Footer */}
      <EmailFooter
        companyName="Orgatick"
        note={`This is a confirmation email for the ${organizationName} organization created by you.`}
      />
    </EmailLayout>
  );
};

OrganizationCreatedEmail.PreviewProps = {
  ownerName: "{{{ownerName}}}",
  organizationName: "{{{organizationName}}}",
  organizationSlug: "{{{organizationSlug}}}",
  dashboardUrl: "{{{dashboardUrl}}}",
  verificationUrl: "{{{verificationUrl}}}",
} satisfies OrganizationCreatedEmailProps;

export default OrganizationCreatedEmail;
