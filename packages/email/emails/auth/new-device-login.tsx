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

export interface NewDeviceLoginEmailProps {
  userName?: string;
  userEmail?: string;
  loggedInAt?: string;
  device?: string;
  browser?: string;
  location?: string;
  ipAddress?: string;
  secureAccountUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const NewDeviceLoginEmail = ({
  userName = "{{{userName}}}",
  userEmail = "{{{userEmail}}}",
  loggedInAt = "{{{loggedInAt}}}",
  device = "{{{device}}}",
  browser = "{{{browser}}}",
  location = "{{{location}}}",
  ipAddress = "{{{ipAddress}}}",
  secureAccountUrl = "{{{secureAccountUrl}}}",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: NewDeviceLoginEmailProps) => {
  const previewText = `Security alert: A new device signed in to your ${companyName} account.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Alert Title */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          New Device Sign-in
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, we noticed a new sign-in to your{" "}
          <strong className="text-foreground">{companyName}</strong> account (
          <span className="text-foreground">{userEmail}</span>).
        </Text>
      </Section>

      {/* Login Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Sign-in Details
          </Heading>
          <EmailInfoRow label="Time" value={loggedInAt} />
          {device && <EmailInfoRow label="Device" value={device} />}
          {browser && <EmailInfoRow label="Browser" value={browser} />}
          {location && <EmailInfoRow label="Location" value={location} />}
          {ipAddress && <EmailInfoRow label="IP Address" value={ipAddress} isMono />}
        </EmailCard>
      </Section>

      {/* Security Guidance */}
      <Section className="px-8 pb-4">
        <Text className="text-[14px] leading-[22px] text-foreground m-0 mb-3">
          <strong>If this was you:</strong> You can safely ignore this email. No further action is required.
        </Text>
        <EmailAlert type="warning" title="If this was NOT you">
          Someone else may have access to your account. Please secure your account immediately by reviewing your recent
          activity and resetting your password.
        </EmailAlert>
        <EmailButton href={secureAccountUrl} variant="destructive">
          Secure Your Account &rarr;
        </EmailButton>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
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
        companyName={companyName}
        year={year}
        securityCenter
        note={`This is an automated security notification regarding your account (${userEmail}).`}
      />
    </EmailLayout>
  );
};

NewDeviceLoginEmail.PreviewProps = {
  userName: "{{{userName}}}",
  userEmail: "{{{userEmail}}}",
  loggedInAt: "{{{loggedInAt}}}",
  device: "{{{device}}}",
  browser: "{{{browser}}}",
  location: "{{{location}}}",
  ipAddress: "{{{ipAddress}}}",
  secureAccountUrl: "{{{secureAccountUrl}}}",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies NewDeviceLoginEmailProps;

export default NewDeviceLoginEmail;
