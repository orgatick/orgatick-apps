import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrganizationPricingUpdatedEmail, renderEmail } from "@orgatick/email-templates";
import { MailService } from "../../../../infrastructure/mail/mail.service";

@Injectable()
export class OrganizationPricingMailerService {
  private readonly logger = new Logger(OrganizationPricingMailerService.name);
  private readonly from: string;
  private readonly replyTo: string;
  private readonly appUrl: string;

  constructor(
    private readonly mailService: MailService,
    configService: ConfigService,
  ) {
    const fromEmail = configService.get<string>("ORGANIZATION_FROM_EMAIL") ?? "no-reply@orgatick.in";
    const fromName = configService.get<string>("ORGANIZATION_FROM_NAME") ?? "Orgatick";
    this.from = `"${fromName}" <${fromEmail}>`;
    this.replyTo = configService.get<string>("ORGANIZATION_SUPPORT_EMAIL") ?? "support@orgatick.in";
    this.appUrl = configService.get<string>("APP_URL") ?? "https://dev.orgatick.site";
  }

  async sendPricingUpdatedNotification(input: {
    recipientEmail: string;
    recipientName: string;
    organizationName: string;
    paidEventsEnabled: boolean;
    requireBankDetails: boolean;
    disabledReason?: string | null;
    updatedByName?: string | null;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.appUrl}/settings`;
      const rendered = await renderEmail(OrganizationPricingUpdatedEmail, {
        recipientName: input.recipientName,
        organizationName: input.organizationName,
        paidEventsEnabled: input.paidEventsEnabled,
        requireBankDetails: input.requireBankDetails,
        disabledReason: input.disabledReason,
        updatedByName: input.updatedByName,
        dashboardUrl,
        supportEmail: this.replyTo,
        companyName: "Orgatick",
        year: new Date().getFullYear(),
      });

      await this.mailService.sendHtml({
        to: input.recipientEmail,
        subject: `Pricing & Paid Event Controls Updated for ${input.organizationName}`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send pricing updated email to ${input.recipientEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
