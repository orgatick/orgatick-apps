import { Heading, Link, Section, Text } from "react-email";
import { EmailAlert, EmailButton, EmailCard, EmailDivider, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface PasswordResetEmailProps {
  userName?: string;
  resetUrl?: string;
  expiresIn?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const PasswordResetEmail = ({
  userName = "{{{userName}}}",
  resetUrl = "{{{resetUrl}}}",
  expiresIn = "30 minutes",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: PasswordResetEmailProps) => {
  const previewText = `Reset your ${companyName} password. This link expires in ${expiresIn}.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Reset Your Password
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, we received a request to reset the password for
          your <strong className="text-foreground">{companyName}</strong> account. Click the button below to choose a
          new password.
        </Text>
      </Section>

      {/* Primary Action Button */}
      <Section className="px-8 pb-4 text-center">
        <EmailButton href={resetUrl} variant="primary">
          Reset Password &rarr;
        </EmailButton>
      </Section>

      {/* Link Fallback */}
      <Section className="px-8 pb-4 text-center">
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
          Or copy and paste this link into your browser:
        </Text>
        <Text className="text-[13px] leading-[20px] text-primary break-all m-0 mt-1">
          <Link href={resetUrl} className="text-primary underline">
            {resetUrl}
          </Link>
        </Text>
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-2">
          This link is valid for <strong className="text-foreground">{expiresIn}</strong> and can only be used once.
        </Text>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Security Alert */}
      <Section className="px-8 py-2">
        <EmailAlert type="warning" title="Didn't request this?">
          If you didn&apos;t request a password reset, you can safely ignore this email. Your password will not be
          changed. {companyName} support will never ask for your password.
        </EmailAlert>
      </Section>

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
      <EmailFooter companyName={companyName} year={year} showPreferences />
    </EmailLayout>
  );
};

PasswordResetEmail.PreviewProps = {
  userName: "{{{userName}}}",
  resetUrl: "{{{resetUrl}}}",
  expiresIn: "30 minutes",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
