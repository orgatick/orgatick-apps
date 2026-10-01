import { Heading, Link, Section, Text } from "react-email";
import { EmailAlert, EmailButton, EmailCard, EmailDivider, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface NewsletterConfirmSubscriptionEmailProps {
  name?: string;
  email?: string;
  listName?: string;
  confirmUrl?: string;
  tokenExpiresIn?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

/**
 * Double opt-in confirmation for a newsletter subscription.
 * Sent by the backend with template id `newsletter-confirm-subscription`.
 */
export const NewsletterConfirmSubscriptionEmail = ({
  name = "{{{first_name}}}",
  email = "{{{email}}}",
  listName = "{{{list_name}}}",
  confirmUrl = "{{{confirm_url}}}",
  tokenExpiresIn = "48 hours",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: NewsletterConfirmSubscriptionEmailProps) => {
  const previewText = `Confirm your subscription to the ${listName} newsletter`;

  return (
    <EmailLayout previewText={previewText}>
      <EmailHeader companyName={companyName} />

      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Confirm your subscription
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{name}</strong>, one last step. Confirm your email address to start
          receiving the <strong className="text-foreground">{listName}</strong> newsletter.
        </Text>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <EmailButton href={confirmUrl} variant="primary">
          Confirm Subscription &rarr;
        </EmailButton>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
          If the button doesn&apos;t work, paste this link into your browser:
        </Text>
        <Text className="text-[13px] leading-[20px] text-primary break-all m-0 mt-1">
          <Link href={confirmUrl} className="text-primary underline">
            {confirmUrl}
          </Link>
        </Text>
        <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-2">
          This link expires in <strong className="text-foreground">{tokenExpiresIn}</strong>.
        </Text>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      <Section className="px-8 py-2">
        <EmailAlert type="info" title="What you subscribed to">
          We&apos;ll send occasional updates about {companyName} events and product news. You can unsubscribe or change
          your preferences from the link in any newsletter, and we never share your address.
        </EmailAlert>
      </Section>

      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Requested for <strong className="text-foreground">{email}</strong>. Need help?{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
          </Text>
        </EmailCard>
      </Section>

      <EmailFooter companyName={companyName} year={year} showPreferences />
    </EmailLayout>
  );
};

NewsletterConfirmSubscriptionEmail.PreviewProps = {
  name: "Alex",
  email: "alex@example.com",
  listName: "Orgatick Monthly",
  confirmUrl: "https://orgatick.in/newsletter/confirm?token=preview",
  tokenExpiresIn: "48 hours",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies NewsletterConfirmSubscriptionEmailProps;

export default NewsletterConfirmSubscriptionEmail;
