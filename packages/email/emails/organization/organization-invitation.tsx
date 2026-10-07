import { Heading, Link, Section, Text } from "react-email";
import { EmailButton, EmailCard, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface OrganizationInvitationEmailProps {
  inviterName?: string;
  organizationName?: string;
  organizationLogo?: string;
  role?: string;
  acceptUrl?: string;
  expiresIn?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

/**
 * Team invitation to an organization. Sent by the backend when an owner or
 * admin invites someone to join their organization with a role.
 */
export const OrganizationInvitationEmail = ({
  inviterName = "An organizer",
  organizationName = "an organization",
  organizationLogo,
  role = "Member",
  acceptUrl = "{{{accept_url}}}",
  expiresIn = "7 days",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: OrganizationInvitationEmailProps) => {
  const previewText = `${inviterName} invited you to join ${organizationName} on ${companyName}`;

  return (
    <EmailLayout previewText={previewText}>
      <EmailHeader companyName={companyName} {...(organizationLogo ? { logoUrl: organizationLogo } : {})} />

      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          You&apos;ve been invited
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          <strong className="text-foreground">{inviterName}</strong> invited you to join{" "}
          <strong className="text-foreground">{organizationName}</strong> on {companyName} as{" "}
          <strong className="text-foreground">{role}</strong>.
        </Text>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <EmailButton href={acceptUrl} variant="primary">
          Accept Invitation &rarr;
        </EmailButton>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
          If the button doesn&apos;t work, paste this link into your browser:
        </Text>
        <Text className="text-[13px] leading-[20px] text-primary break-all m-0 mt-1">
          <Link href={acceptUrl} className="text-primary underline">
            {acceptUrl}
          </Link>
        </Text>
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-2">
          Sign in with the email that received this invitation, then accept. This link expires in{" "}
          <strong>{expiresIn}</strong>.
        </Text>
      </Section>

      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Not expecting this invitation? You can ignore it — the link expires on its own, and no membership is created
            until you accept. Need help?{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
          </Text>
        </EmailCard>
      </Section>

      <EmailFooter companyName={companyName} year={year} />
    </EmailLayout>
  );
};

OrganizationInvitationEmail.PreviewProps = {
  inviterName: "Priya Sharma",
  organizationName: "Sunrise Events",
  role: "Event Manager",
  acceptUrl: "https://dev.orgatick.site/invitation/preview-token",
  expiresIn: "7 days",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies OrganizationInvitationEmailProps;

export default OrganizationInvitationEmail;
