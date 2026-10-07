import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrganizationInvitationEmail, renderEmail } from "@orgatick/email-templates";
import { MailService } from "../../../../infrastructure/mail/mail.service";

/**
 * Sends organization team-invitation emails. Failures are logged, never thrown:
 * the invitation record must survive even when the provider rejects the message,
 * because the invitation can be resent from the team page.
 */
@Injectable()
export class OrganizationInvitationMailerService {
  private readonly logger = new Logger(OrganizationInvitationMailerService.name);
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
    this.appUrl = configService.get<string>("APP_URL") ?? "";
  }

  buildAcceptUrl(token: string): string {
    return `${this.appUrl}/invitation/${token}`;
  }

  async sendInvitation(input: {
    email: string;
    inviterName: string;
    organizationName: string;
    organizationLogo?: string | null;
    role: string;
    token: string;
  }): Promise<void> {
    try {
      const acceptUrl = this.buildAcceptUrl(input.token);
      const rendered = await renderEmail(OrganizationInvitationEmail, {
        inviterName: input.inviterName,
        organizationName: input.organizationName,
        organizationLogo: input.organizationLogo ?? undefined,
        role: input.role,
        acceptUrl,
        expiresIn: "7 days",
        supportEmail: this.replyTo,
        companyName: "Orgatick",
        year: new Date().getFullYear(),
      });

      await this.mailService.sendHtml({
        to: input.email,
        subject: `${input.inviterName} invited you to join ${input.organizationName} on Orgatick`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "type", value: "organization_invitation" }],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send invitation email to ${input.email}: ${message}`);
    }
  }
}
