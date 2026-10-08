import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NewsletterRecipientStatus, NewsletterStatus, NewsletterSubscriberStatus } from "@orgatick/contracts";
import { MailService } from "../../../infrastructure/mail/mail.service";
import { NEWSLETTER_TAG_NAME } from "../constants/newsletter.constants";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterRenderService } from "./newsletter-render.service";
import { NewsletterTokenService } from "./newsletter-token.service";
import type { NewsletterRenderContext } from "../types/newsletter.types";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

function firstNameOf(name?: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  return first ? first : "there";
}

@Injectable()
export class NewsletterDeliveryService {
  private readonly logger = new Logger(NewsletterDeliveryService.name);
  private readonly publicBaseUrl: string;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly tokenService: NewsletterTokenService,
    private readonly renderService: NewsletterRenderService,
    private readonly mailService: MailService,
    configService: ConfigService,
  ) {
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  async deliverRecipient(
    newsletterId: bigint,
    recipientId: bigint,
    options: { finalAttempt: boolean },
  ): Promise<{ providerMessageId: string | null }> {
    const campaign = await this.newsletterRepository.findById(newsletterId);
    if (!campaign || campaign.status !== NewsletterStatus.SENDING) {
      return { providerMessageId: null };
    }

    const recipient = await this.recipientRepository.findById(recipientId);
    if (!recipient || recipient.status !== NewsletterRecipientStatus.QUEUED) {
      return { providerMessageId: null };
    }

    await this.recipientRepository.markProcessing(recipient.id);
    const subscriber = recipient.subscriberId ? await this.subscriberRepository.findById(recipient.subscriberId) : null;

    if (subscriber && subscriber.status !== NewsletterSubscriberStatus.SUBSCRIBED) {
      await this.recipientRepository.markSent(recipient.id, null, NewsletterRecipientStatus.SKIPPED);
      await this.finalize(campaign);
      return { providerMessageId: null };
    }

    try {
      const context = this.buildContext(campaign, recipient.id, subscriber?.uuid, subscriber?.name, recipient.email);
      const rendered = this.renderService.renderCampaign(campaign, context);

      const response = await this.mailService.sendHtml({
        to: recipient.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        from: `${campaign.fromName} <${campaign.fromEmail}>`,
        replyTo: campaign.replyTo ?? undefined,
        headers: {
          "List-Unsubscribe": `<${context.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [{ name: NEWSLETTER_TAG_NAME, value: String(campaign.id) }],
      });

      if (response.error) throw new Error(response.error.message);

      const providerMessageId = response.data?.id ?? null;
      await this.recipientRepository.markSent(recipient.id, providerMessageId, NewsletterRecipientStatus.SENT);
      await this.finalize(campaign);

      return { providerMessageId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!options.finalAttempt) {
        await this.recipientRepository.markQueued(recipient.id, message);
        throw error;
      }
      await this.recipientRepository.markFailed(recipient.id, message);
      await this.finalize(campaign);
      this.logger.error(`Recipient ${String(recipient.id)} failed permanently: ${message}`);
      return { providerMessageId: null };
    }
  }

  async finalize(campaign: Newsletter): Promise<void> {
    const remaining = await this.recipientRepository.pendingCount(campaign.id);
    if (remaining > 0) return;

    const counts = await this.recipientRepository.statsFor(campaign.id);
    await this.newsletterRepository.updateCounters(campaign.id, counts);

    campaign.status =
      counts.sentCount === 0 && counts.failedCount > 0 ? NewsletterStatus.FAILED : NewsletterStatus.SENT;
    campaign.completedAt = new Date();
    await this.newsletterRepository.save(campaign);

    this.logger.log(`Campaign ${String(campaign.id)} completed with status ${campaign.status}`);
  }

  private buildContext(
    campaign: Newsletter,
    recipientId: bigint,
    subscriberUuid?: string | null,
    subscriberName?: string | null,
    email?: string,
  ): NewsletterRenderContext {
    const unsubscribeToken = subscriberUuid ? this.tokenService.createUnsubscribeToken(subscriberUuid) : "";
    const manageToken = subscriberUuid ? this.tokenService.createManageToken(subscriberUuid) : "";

    return {
      recipientId: String(recipientId),
      firstName: firstNameOf(subscriberName),
      email: email ?? "",
      listName: campaign.list?.name ?? "Orgatick Newsletter",
      unsubscribeUrl: unsubscribeToken
        ? `${this.publicBaseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
        : `${this.publicBaseUrl}/newsletter`,
      preferencesUrl: manageToken
        ? `${this.publicBaseUrl}/newsletter/preferences?token=${encodeURIComponent(manageToken)}`
        : `${this.publicBaseUrl}/newsletter`,
      viewInBrowserUrl: `${this.publicBaseUrl}/newsletter/campaign/${campaign.uuid}`,
    };
  }
}
