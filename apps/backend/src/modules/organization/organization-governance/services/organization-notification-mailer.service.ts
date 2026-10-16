import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  OrganizationCreatedEmail,
  OrganizationVerificationApprovedEmail,
  OrganizationVerificationRejectedEmail,
  OrganizationVerificationRequestReceivedEmail,
  renderEmail,
} from "@orgatick/email-templates";
import { MailService } from "../../../../infrastructure/mail/mail.service";

@Injectable()
export class OrganizationNotificationMailerService {
  private readonly logger = new Logger(OrganizationNotificationMailerService.name);
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
    this.appUrl =
      configService.get<string>("ORGANIZER_APP_URL") ??
      configService.get<string>("APP_URL") ??
      "https://dev.orgatick.site";
  }

  async sendOrganizationCreated(input: {
    recipientEmail: string;
    ownerName: string;
    organizationName: string;
    organizationSlug: string;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.appUrl}`;
      const verificationUrl = `${this.appUrl}/verification`;
      const rendered = await renderEmail(OrganizationCreatedEmail, {
        ownerName: input.ownerName,
        organizationName: input.organizationName,
        organizationSlug: input.organizationSlug,
        dashboardUrl,
        verificationUrl,
      });

      await this.mailService.sendHtml({
        to: input.recipientEmail,
        subject: `Your organization ${input.organizationName} has been created`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "type", value: "organization_created" }],
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send organization created email to ${input.recipientEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async sendVerificationRequestReceived(input: {
    recipientEmail: string;
    ownerName: string;
    organizationName: string;
    verificationReference?: string;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.appUrl}/verification`;
      const rendered = await renderEmail(OrganizationVerificationRequestReceivedEmail, {
        ownerName: input.ownerName,
        organizationName: input.organizationName,
        verificationReference: input.verificationReference ?? `VER-${Date.now().toString().slice(-6)}`,
        submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        reviewTimeline: "24-48 hours",
        dashboardUrl,
        supportEmail: this.replyTo,
        companyName: "Orgatick",
        year: new Date().getFullYear(),
      });

      await this.mailService.sendHtml({
        to: input.recipientEmail,
        subject: `Verification request received for ${input.organizationName}`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "type", value: "verification_requested" }],
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send verification request received email to ${input.recipientEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async sendVerificationApproved(input: {
    recipientEmail: string;
    ownerName: string;
    organizationName: string;
    organizationSlug: string;
    verifiedAt?: string;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.appUrl}`;
      const onboardingUrl = `${this.appUrl}/settings`;
      const rendered = await renderEmail(OrganizationVerificationApprovedEmail, {
        ownerName: input.ownerName,
        organizationName: input.organizationName,
        organizationSlug: input.organizationSlug,
        verifiedAt:
          input.verifiedAt ??
          new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dashboardUrl,
        onboardingUrl,
        supportEmail: this.replyTo,
        companyName: "Orgatick",
        year: new Date().getFullYear(),
      });

      await this.mailService.sendHtml({
        to: input.recipientEmail,
        subject: `Congratulations! ${input.organizationName} is now verified on Orgatick`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "type", value: "verification_approved" }],
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send verification approved email to ${input.recipientEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async sendVerificationRejected(input: {
    recipientEmail: string;
    ownerName: string;
    organizationName: string;
    reason: string;
    reapplyUrl?: string;
  }): Promise<void> {
    try {
      const dashboardUrl = `${this.appUrl}`;
      const reapplyUrl = input.reapplyUrl ?? `${this.appUrl}/verification`;
      const rendered = await renderEmail(OrganizationVerificationRejectedEmail, {
        ownerName: input.ownerName,
        organizationName: input.organizationName,
        reason: input.reason,
        canReapply: true,
        reapplyUrl,
        dashboardUrl,
        supportEmail: this.replyTo,
        companyName: "Orgatick",
        year: new Date().getFullYear(),
      });

      await this.mailService.sendHtml({
        to: input.recipientEmail,
        subject: `Update on verification request for ${input.organizationName}`,
        html: rendered.html,
        text: rendered.text,
        from: this.from,
        replyTo: this.replyTo,
        tags: [{ name: "type", value: "verification_rejected" }],
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send verification rejected email to ${input.recipientEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
