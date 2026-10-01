import { Heading, Link, Section, Text } from "react-email";
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

export interface PasswordChangedAlertEmailProps {
  userName?: string;
  userEmail?: string;
  changedAt?: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  secureAccountUrl?: string;
  supportEmail?: string;
  year?: number;
}

export const PasswordChangedAlertEmail = ({
  userName = "{{{name}}}",
  userEmail = "{{{email}}}",
  changedAt = "{{{changedAt}}}",
  device = "{{{device}}}",
  location = "{{{location}}}",
  ipAddress = "{{{ipAddress}}}",
  secureAccountUrl = "{{{secureAccountUrl}}}",
  supportEmail = "support@orgatick.in",
  year = 2026,
}: PasswordChangedAlertEmailProps) => {
  const previewText = `Security alert: Your orgatick password was recently changed.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName="Orgatick" />

      {/* Alert Title */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Password Changed Successfully
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, the password for your{" "}
          <strong className="text-foreground">Orgatick</strong> account (
          <span className="text-foreground">{userEmail}</span>) was recently changed.
        </Text>
      </Section>

      {/* Event Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Activity Details
          </Heading>
          <EmailInfoRow label="Time" value={changedAt} />
          {device && <EmailInfoRow label="Device / Browser" value={device} />}
          {location && <EmailInfoRow label="Location" value={location} />}
          {ipAddress && <EmailInfoRow label="IP Address" value={ipAddress} isMono />}
        </EmailCard>
      </Section>

      {/* Security Guidance & Action */}
      <Section className="px-8 pb-4">
        <Text className="text-[14px] leading-[22px] text-foreground m-0 mb-3">
          <strong>If you made this change:</strong> You can safely ignore this email. No further action is required.
        </Text>
        <Text className="text-[14px] leading-[22px] text-foreground m-0 mb-3">
          <strong>If you did NOT make this change:</strong> Your account may be compromised. Please secure your account
          immediately by resetting your password.
        </Text>

        <EmailButton href={secureAccountUrl} variant="destructive">
          Secure Your Account &rarr;
        </EmailButton>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Security Tip Alert */}
      <Section className="px-8 py-2">
        <EmailAlert type="warning" title="Security Reminder">
          Never share your password, verification codes, or two-factor recovery keys with anyone. Our staff will never
          ask for your password.
        </EmailAlert>
      </Section>

      {/* Support Notice */}
      <Section className="px-8 pb-6">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Need help? Contact our security team at{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
          </Text>
        </EmailCard>
      </Section>

      {/* Footer */}
      <EmailFooter
        companyName="Orgatick"
        year={year}
        securityCenter
        note={`This is an automated security notification regarding your account (${userEmail}).`}
      />
    </EmailLayout>
  );
};

PasswordChangedAlertEmail.PreviewProps = {
  userName: "{{{name}}}",
  userEmail: "{{{email}}}",
  changedAt: "{{{changedAt}}}",
  device: "{{{device}}}",
  location: "{{{location}}}",
  ipAddress: "{{{ipAddress}}}",
  secureAccountUrl: "{{{secureAccountUrl}}}",
  supportEmail: "support@orgatick.in",
  year: 2026,
} satisfies PasswordChangedAlertEmailProps;

export default PasswordChangedAlertEmail;
