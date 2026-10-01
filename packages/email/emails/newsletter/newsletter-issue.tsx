import { Heading, Hr, Link, Section, Text } from "react-email";
import { EmailButton, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface NewsletterIssueEmailProps {
  /** Inbox preview line. */
  previewText?: string;
  heroImageUrl?: string;
  heroAlt?: string;
  heading?: string;
  intro?: string;
  /**
   * Pre-rendered inner content, produced by the backend block renderer.
   * Injected raw so provider-side variable substitution keeps working.
   */
  contentHtml?: string;
  ctaText?: string;
  ctaUrl?: string;
  viewInBrowserUrl?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
  listName?: string;
  companyName?: string;
  year?: number;
}

/**
 * Branded layout for a newsletter issue (campaign send).
 *
 * The default delivery path in the backend renders block content to HTML itself and
 * sends it directly. This template exists so the same issue can be sent through a
 * provider-hosted template, and so designers can iterate on the shell in the
 * React Email preview server.
 */
export const NewsletterIssueEmail = ({
  previewText = "{{{preview_text}}}",
  heroImageUrl,
  heroAlt = "",
  heading = "{{{heading}}}",
  intro = "{{{intro}}}",
  contentHtml = "{{{content_html}}}",
  ctaText,
  ctaUrl,
  viewInBrowserUrl = "{{{view_in_browser_url}}}",
  unsubscribeUrl = "{{{unsubscribe_url}}}",
  preferencesUrl = "{{{preferences_url}}}",
  listName = "{{{list_name}}}",
  companyName = "Orgatick",
  year = 2026,
}: NewsletterIssueEmailProps) => {
  const inlineText = previewText ?? "The latest from Orgatick";

  return (
    <EmailLayout previewText={inlineText}>
      <EmailHeader companyName={companyName} />

      <Section className="px-8 pt-2">
        <Text className="text-[11px] uppercase tracking-wider text-muted-foreground m-0 text-center font-mono">
          {listName}
        </Text>
      </Section>

      {heroImageUrl ? (
        <Section className="px-0 pt-4">
          <img
            src={heroImageUrl}
            alt={heroAlt}
            width="100%"
            style={{ display: "block", width: "100%", height: "auto", border: "0" }}
          />
        </Section>
      ) : null}

      <Section className="px-8 pt-6 pb-2 text-center">
        <Heading as="h1" className="text-[26px] font-bold tracking-tight text-foreground m-0">
          {heading}
        </Heading>
        {intro ? <Text className="text-[15px] leading-[24px] text-muted-foreground mt-3 mb-0">{intro}</Text> : null}
      </Section>

      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: admin-authored campaign content, contract-validated before send */}
      <Section className="px-8 pb-2" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {ctaText && ctaUrl ? (
        <Section className="px-8 pb-6 text-center">
          <EmailButton href={ctaUrl} variant="primary">
            {ctaText} &rarr;
          </EmailButton>
        </Section>
      ) : null}

      <Hr className="mx-8 my-4 border-border" />

      <Section className="px-8 pb-4 text-center">
        <Text className="text-[12px] leading-[18px] text-muted-foreground m-0">
          Trouble viewing this email?{" "}
          <Link href={viewInBrowserUrl} className="text-primary underline">
            View it in your browser
          </Link>
        </Text>
      </Section>

      <Section className="px-8 pb-6 text-center">
        <Text className="text-[12px] leading-[18px] text-muted-foreground m-0">
          You are receiving this because you subscribed to {listName}.{" "}
          <Link href={unsubscribeUrl} className="text-muted-foreground underline">
            Unsubscribe
          </Link>{" "}
          &bull;{" "}
          <Link href={preferencesUrl} className="text-muted-foreground underline">
            Manage preferences
          </Link>
        </Text>
      </Section>

      <EmailFooter companyName={companyName} year={year} showPreferences preferencesUrl={preferencesUrl} />
    </EmailLayout>
  );
};

NewsletterIssueEmail.PreviewProps = {
  previewText: "Three new features shipping this month",
  heroImageUrl: "https://assets.orgatick.in/public/images/newsletter-hero.png",
  heroAlt: "Orgatick platform",
  heading: "What's new at Orgatick",
  intro: "A quick look at what shipped, what's next, and the events worth bookmarking this month.",
  contentHtml:
    "<p style='margin:0 0 12px;font-size:15px;line-height:25px;color:#6c7480'>Hi there, here are the three things that changed most this month.</p>",
  ctaText: "Browse events",
  ctaUrl: "https://orgatick.in/events",
  viewInBrowserUrl: "https://orgatick.in/newsletter/preview",
  unsubscribeUrl: "https://orgatick.in/newsletter/unsubscribe",
  preferencesUrl: "https://orgatick.in/newsletter/preferences",
  listName: "Orgatick Monthly",
  companyName: "Orgatick",
  year: 2026,
} satisfies NewsletterIssueEmailProps;

export default NewsletterIssueEmail;
