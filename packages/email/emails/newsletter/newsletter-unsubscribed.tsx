import { Heading, Section, Text } from "react-email";
import { EmailButton, EmailCard, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface NewsletterUnsubscribedEmailProps {
  email?: string;
  listName?: string;
  resubscribeUrl?: string;
  preferencesUrl?: string;
  companyName?: string;
  year?: number;
}

/**
 * Confirms an unsubscribe so the action is never silent, and offers a one-click
 * way back. Sent by the backend with template id `newsletter-unsubscribed`.
 */
export const NewsletterUnsubscribedEmail = ({
  email = "{{{email}}}",
  listName = "{{{list_name}}}",
  resubscribeUrl = "{{{resubscribe_url}}}",
  preferencesUrl = "{{{preferences_url}}}",
  companyName = "Orgatick",
  year = 2026,
}: NewsletterUnsubscribedEmailProps) => {
  const previewText = `You have been unsubscribed from ${listName}`;

  return (
    <EmailLayout previewText={previewText}>
      <EmailHeader companyName={companyName} />

      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          You&apos;ve been unsubscribed
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          <strong className="text-foreground">{email}</strong> will no longer receive the{" "}
          <strong className="text-foreground">{listName}</strong> newsletter. Your account and ticket emails are
          unaffected.
        </Text>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <EmailButton href={resubscribeUrl} variant="outline">
          Resubscribe
        </EmailButton>
      </Section>

      <Section className="px-8 pb-8">
        <EmailCard variant="muted" className="p-4">
          <Text className="text-[14px] leading-[22px] text-foreground m-0">
            <strong>Rather hear less?</strong>
          </Text>
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-1">
            Instead of unsubscribing entirely, pick the topics you actually care about. You can restore the rest at any
            time.
          </Text>
          <Text className="text-[13px] leading-[20px] m-0 mt-2">
            <a href={preferencesUrl} className="text-primary underline font-medium">
              Choose your topics
            </a>
          </Text>
        </EmailCard>
      </Section>

      <EmailFooter companyName={companyName} year={year} preferencesUrl={preferencesUrl} />
    </EmailLayout>
  );
};

NewsletterUnsubscribedEmail.PreviewProps = {
  email: "alex@example.com",
  listName: "Orgatick Monthly",
  resubscribeUrl: "https://orgatick.in/newsletter/subscribe?token=preview",
  preferencesUrl: "https://orgatick.in/newsletter/preferences",
  companyName: "Orgatick",
  year: 2026,
} satisfies NewsletterUnsubscribedEmailProps;

export default NewsletterUnsubscribedEmail;
