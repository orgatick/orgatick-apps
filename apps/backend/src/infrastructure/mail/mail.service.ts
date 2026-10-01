import { Inject, Injectable, Logger } from "@nestjs/common";
import type { CreateEmailOptions, Resend } from "resend";
import { RESEND } from "./resend.provider";

interface SendTemplateOptions {
  to: string | string[];
  templateId: string;
  variables?: Record<string, string | number>;
}

interface SendHtmlOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Required by the provider API for every rendered-HTML send. */
  from: string;
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(RESEND)
    private readonly resend: Resend,
  ) {}

  async sendTemplate(options: SendTemplateOptions) {
    return this.resend.emails.send({
      to: options.to,
      template: {
        id: options.templateId,
        variables: options.variables,
      },
    });
  }

  /**
   * Sends a fully rendered HTML email.
   *
   * Used for newsletter campaigns, whose content is assembled per recipient and
   * therefore cannot be served from a provider-hosted template. Every failure is
   * logged with the provider response so delivery problems stay diagnosable, and
   * the result is returned instead of thrown so batch sends can record the error
   * against the individual recipient.
   */
  async sendHtml(options: SendHtmlOptions) {
    const payload: CreateEmailOptions = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: options.from,
      replyTo: options.replyTo,
      headers: options.headers,
      tags: options.tags,
    };

    try {
      const response = await this.resend.emails.send(payload);

      if (response.error) {
        this.logger.warn(`Failed to send email to ${String(options.to)}: ${response.error.message}`);
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Email provider error for ${String(options.to)}: ${message}`);
      throw error;
    }
  }
}
