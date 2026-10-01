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

export interface AccountDeletedEmailProps {
  userName?: string;
  userEmail?: string;
  deletedAt?: string;
  restoreUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const AccountDeletedEmail = ({
  userName = "{{{userName}}}",
  userEmail = "{{{userEmail}}}",
  deletedAt = "{{{deletedAt}}}",
  restoreUrl = "{{{restoreUrl}}}",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: AccountDeletedEmailProps) => {
  const previewText = `Your ${companyName} account has been deleted as requested.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Your Account Has Been Deleted
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, as requested, your{" "}
          <strong className="text-foreground">{companyName}</strong> account (
          <span className="text-foreground">{userEmail}</span>) has been permanently deleted.
        </Text>
      </Section>

      {/* Deletion Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Account Details
          </Heading>
          <EmailInfoRow label="Account" value={userEmail} isMono />
          {deletedAt && <EmailInfoRow label="Deleted on" value={deletedAt} />}
        </EmailCard>
      </Section>

      {/* Guidance */}
      <Section className="px-8 pb-4">
        <Text className="text-[14px] leading-[22px] text-foreground m-0 mb-3">
          <strong>What happens now?</strong> All of your personal data, preferences, and content associated with this
          account have been removed and can no longer be recovered.
        </Text>
        {restoreUrl && (
          <EmailAlert type="warning" title="Changed your mind?">
            If this deletion was a mistake, you may be able to restore your account within the grace period.{" "}
            <Link href={restoreUrl} className="text-primary underline font-medium">
              Try to restore your account
            </Link>
            .
          </EmailAlert>
        )}
        <Text className="text-[14px] leading-[22px] text-muted-foreground m-0 mb-2">
          If you didn&apos;t request this deletion, please contact our team immediately.
        </Text>
        <EmailButton href={`mailto:${supportEmail}`} variant="destructive">
          Contact Support
        </EmailButton>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Support Notice */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Questions about your deleted account? Contact us at{" "}
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
        note={`This is a confirmation email regarding the deletion of the account ${userEmail}.`}
      />
    </EmailLayout>
  );
};

AccountDeletedEmail.PreviewProps = {
  userName: "{{{userName}}}",
  userEmail: "{{{userEmail}}}",
  deletedAt: "{{{deletedAt}}}",
  restoreUrl: "{{{restoreUrl}}}",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies AccountDeletedEmailProps;

export default AccountDeletedEmail;
