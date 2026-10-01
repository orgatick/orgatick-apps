import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  renderEmail,
  type EmailTemplate,
  type NewsletterConfirmSubscriptionEmailProps,
  type NewsletterUnsubscribedEmailProps,
  type NewsletterWelcomeEmailProps,
  NewsletterConfirmSubscriptionEmail,
  NewsletterUnsubscribedEmail,
  NewsletterWelcomeEmail,
} from "@orgatick/email-templates";
import { MailService } from "../../../infrastructure/mail/mail.service";
import { NEWSLETTER_BRAND, NEWSLETTER_FROM_EMAIL, NEWSLETTER_SUPPORT_EMAIL } from "../constants/newsletter.constants";

/**
 * Sends the transactional lifecycle emails (double opt-in, welcome, unsubscribe receipt).
 *
 * Templates come from `@orgatick/email-templates` and are rendered per recipient, so there
 * is no provider-side template to provision or keep in sync. These are deliberately not
 * campaign sends: they go out even when tracking is off and are never retried by the
 * campaign dispatcher. Failures are logged, never thrown, because a subscriber must still
 * reach `subscribed` even if the confirmation email bounces.
 */
@Injectable()
export class NewsletterMailerService {
  private readonly logger = new Logger(NewsletterMailerService.name);
  private readonly from: string;
  private readonly replyTo: string;

  constructor(
    private readonly mailService: MailService,
    configService: ConfigService,
  ) {
    // Resend requires a literal sender on every rendered-HTML send, so it is built from
    // the Orgatick newsletter identity rather than the provider's default domain.
    const fromEmail = configService.get<string>("NEWSLETTER_FROM_EMAIL") ?? NEWSLETTER_FROM_EMAIL;
    const fromName = configService.get<string>("NEWSLETTER_FROM_NAME") ?? NEWSLETTER_BRAND.name;
    this.from = `"${fromName}" <${fromEmail}>`;
    this.replyTo = configService.get<string>("NEWSLETTER_REPLY_TO") ?? NEWSLETTER_SUPPORT_EMAIL;
  }

  async sendConfirmationEmail(input: {
    email: string;
    name?: string | null;
    confirmUrl: string;
    listName: string;
  }): Promise<void> {
    await this.send(
      "newsletter-confirm-subscription",
      input.email,
      `Confirm your ${input.listName} subscription`,
      NewsletterConfirmSubscriptionEmail,
      {
        name: input.name ?? "",
        email: input.email,
        listName: input.listName,
        confirmUrl: input.confirmUrl,
        supportEmail: this.replyTo,
        companyName: NEWSLETTER_BRAND.name,
        year: new Date().getFullYear(),
      } satisfies NewsletterConfirmSubscriptionEmailProps,
    );
  }

  async sendWelcomeEmail(input: {
    email: string;
    name?: string | null;
    preferencesUrl: string;
    listName: string;
  }): Promise<void> {
    await this.send(
      "newsletter-welcome",
      input.email,
      `You are subscribed to ${input.listName}`,
      NewsletterWelcomeEmail,
      {
        firstName: input.name?.trim() || "there",
        listName: input.listName,
        preferencesUrl: input.preferencesUrl,
        companyName: NEWSLETTER_BRAND.name,
        year: new Date().getFullYear(),
      } satisfies NewsletterWelcomeEmailProps,
    );
  }

  async sendUnsubscribedEmail(input: {
    email: string;
    resubscribeUrl: string;
    preferencesUrl: string;
    listName: string;
  }): Promise<void> {
    await this.send(
      "newsletter-unsubscribed",
      input.email,
      `You have been unsubscribed from ${input.listName}`,
      NewsletterUnsubscribedEmail,
      {
        email: input.email,
        listName: input.listName,
        resubscribeUrl: input.resubscribeUrl,
        preferencesUrl: input.preferencesUrl,
        companyName: NEWSLETTER_BRAND.name,
        year: new Date().getFullYear(),
      } satisfies NewsletterUnsubscribedEmailProps,
    );
  }

  private async send<TProps extends object>(
    label: string,
    to: string,
    subject: string,
    template: EmailTemplate<TProps>,
    props: TProps,
  ): Promise<void> {
    try {
      const { html, text } = await renderEmail(template, props);

      const response = await this.mailService.sendHtml({
        to,
        subject,
        html,
        text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "newsletter_template", value: label }],
      });

      if (response.error) {
        this.logger.warn(`Newsletter lifecycle email failed (${label}) for ${to}: ${response.error.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Newsletter lifecycle email error (${label}) for ${to}: ${message}`);
    }
  }
}
