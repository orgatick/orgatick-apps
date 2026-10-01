import { Heading, Link, Section, Text } from "react-email";
import { EmailButton, EmailCard, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface NewsletterWelcomeEmailProps {
  firstName?: string;
  listName?: string;
  preferencesUrl?: string;
  companyName?: string;
  year?: number;
}

/**
 * Sent right after a subscription is confirmed (double opt-in completed).
 * Sent by the backend with template id `newsletter-welcome`.
 */
export const NewsletterWelcomeEmail = ({
  firstName = "{{{first_name}}}",
  listName = "{{{list_name}}}",
  preferencesUrl = "{{{preferences_url}}}",
  companyName = "Orgatick",
  year = 2026,
}: NewsletterWelcomeEmailProps) => {
  const previewText = `You're subscribed to the ${listName} newsletter`;

  return (
    <EmailLayout previewText={previewText}>
      <EmailHeader companyName={companyName} />

      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[26px] font-bold tracking-tight text-foreground m-0 mb-3">
          You&apos;re on the list!
        </Heading>
        <Text className="text-[16px] leading-[26px] text-muted-foreground m-0">
          Thanks for confirming, <strong className="text-foreground">{firstName}</strong>. The{" "}
          <strong className="text-foreground">{listName}</strong> newsletter is now headed your way.
        </Text>
      </Section>

      <Section className="px-8 pb-4 text-center">
        <EmailButton href="https://orgatick.in/events" variant="primary">
          Explore Upcoming Events &rarr;
        </EmailButton>
      </Section>

      <Section className="px-8 pb-8">
        <EmailCard variant="muted" className="p-4">
          <Text className="text-[14px] leading-[22px] text-foreground m-0">
            <strong>Only the topics you want</strong>
          </Text>
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-1">
            Every issue ends with a one-click preferences link. Use it any time to change what you hear about, or to
            pause the newsletter without leaving your account.
          </Text>
          <Text className="text-[13px] leading-[20px] m-0 mt-2">
            <Link href={preferencesUrl} className="text-primary underline font-medium">
              Manage your newsletter preferences
            </Link>
          </Text>
        </EmailCard>
      </Section>

      <EmailFooter companyName={companyName} year={year} showPreferences preferencesUrl={preferencesUrl} />
    </EmailLayout>
  );
};

NewsletterWelcomeEmail.PreviewProps = {
  firstName: "Alex",
  listName: "Orgatick Monthly",
  preferencesUrl: "https://orgatick.in/newsletter/preferences",
  companyName: "Orgatick",
  year: 2026,
} satisfies NewsletterWelcomeEmailProps;

export default NewsletterWelcomeEmail;
