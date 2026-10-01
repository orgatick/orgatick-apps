import { Heading, Link, Section, Text } from "react-email";
import { EmailAlert, EmailButton, EmailCard, EmailDivider, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface EmailVerificationEmailProps {
  userName?: string;
  verificationUrl?: string;
  expiresIn?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const EmailVerificationEmail = ({
  userName = "{{{userName}}}",
  verificationUrl = "{{{verificationUrl}}}",
  expiresIn = "24 hours",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: EmailVerificationEmailProps) => {
  const previewText = `Verify your email address to activate your ${companyName} account.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Verify Your Email Address
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, almost there! Please verify your email address to
          activate your <strong className="text-foreground">{companyName}</strong> account.
        </Text>
      </Section>

      {/* Primary Action Button */}
      <Section className="px-8 pb-4 text-center">
        <EmailButton href={verificationUrl} variant="primary">
          Verify Email Address &rarr;
        </EmailButton>
      </Section>

      {/* Link Fallback */}
      <Section className="px-8 pb-4 text-center">
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
          If the button doesn&apos;t work, copy and paste this link into your browser:
        </Text>
        <Text className="text-[13px] leading-[20px] text-primary break-all m-0 mt-1">
          <Link href={verificationUrl} className="text-primary underline">
            {verificationUrl}
          </Link>
        </Text>
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-2">
          This link expires in <strong className="text-foreground">{expiresIn}</strong>.
        </Text>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Action Required Alert */}
      <Section className="px-8 py-2">
        <EmailAlert type="warning" title="Didn't request this?">
          If you didn&apos;t create a {companyName} account, you can safely ignore this email. No further action is
          needed.
        </EmailAlert>
      </Section>

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Need help verifying? Contact us at{" "}
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

EmailVerificationEmail.PreviewProps = {
  userName: "{{{userName}}}",
  verificationUrl: "{{{verificationUrl}}}",
  expiresIn: "24 hours",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies EmailVerificationEmailProps;

export default EmailVerificationEmail;
