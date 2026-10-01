import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  NewsletterEventType,
  NewsletterRecipientStatus,
  NewsletterSubscriberStatus,
  type ManageSubscriptionResponse,
  type UnsubscribeNewsletterResponse,
  type UpdateNewsletterPreferencesDto,
} from "@orgatick/contracts";
import { NewsletterRecipient } from "../entities/newsletter-recipient.entity";
import { NewsletterEventRepository } from "../repositories/newsletter-event.repository";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterSubscriberService } from "./newsletter-subscriber.service";

/** Provider deliverability payload. Resend-style: a single event per callback. */
export interface NewsletterWebhookEvent {
  type: string;
  created_at?: string;
  data?: {
    email?: string;
    message_id?: string;
    bounce?: { type?: string; message?: string };
    complaint?: string;
    tags?: { name: string; value: string }[];
  };
}

export interface TrackingContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Records engagement (opens, clicks, bounces, complaints) and applies the suppression
 * rules that follow from it.
 */
@Injectable()
export class NewsletterTrackingService {
  private readonly logger = new Logger(NewsletterTrackingService.name);
  private readonly enabled: boolean;
  private readonly webhookSecret: string | null;

  constructor(
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly eventRepository: NewsletterEventRepository,
    private readonly subscriberService: NewsletterSubscriberService,
    configService: ConfigService,
  ) {
    this.enabled = configService.get<string>("NEWSLETTER_TRACKING_ENABLED") === "true";
    this.webhookSecret = configService.get<string>("NEWSLETTER_WEBHOOK_SECRET") ?? null;
  }

  /**
   * Open pixel. Idempotent on `open_count` so Apple Mail's repeated prefetches do not
   * inflate the open rate.
   */
  async recordOpen(recipientId: bigint, context: TrackingContext): Promise<void> {
    if (!this.enabled) return;

    const recipient = await this.requireRecipient(recipientId);

    // Only the first pixel fetch counts, so repeated prefetches are a no-op.
    const recorded = await this.recipientRepository.markOpened(recipientId);
    if (!recorded) return;

    await this.eventRepository.record({
      newsletterId: recipient.newsletterId,
      recipientId,
      subscriberId: recipient.subscriberId ?? null,
      type: NewsletterEventType.OPEN,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    });

    await this.recipientRepository.refreshFromEvents(recipient.newsletterId);
  }

  /** Click redirect. The caller must validate that the target URL is safe to redirect to. */
  async recordClick(recipientId: bigint, url: string, context: TrackingContext): Promise<void> {
    if (!this.enabled) return;

    const recipient = await this.requireRecipient(recipientId);

    // Every redirect is attributed so top-link reporting stays accurate, while the
    // recipient only enters the clicked state once.
    await this.recipientRepository.markClickedIfFirst(recipientId);
    await this.recipientRepository.incrementClickCount(recipientId);

    await this.eventRepository.record({
      newsletterId: recipient.newsletterId,
      recipientId,
      subscriberId: recipient.subscriberId ?? null,
      type: NewsletterEventType.CLICK,
      url,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    });

    await this.recipientRepository.refreshFromEvents(recipient.newsletterId);
  }

  /**
   * Handles a provider deliverability callback.
   *
   * A hard bounce or a spam complaint permanently suppresses the address across every
   * list: continuing to mail it would damage the sending domain.
   */
  async handleWebhook(rawBody: string, signature: string | undefined): Promise<{ handled: boolean }> {
    if (this.webhookSecret) {
      this.verifySignature(rawBody, signature ?? "");
    }

    let event: NewsletterWebhookEvent;
    try {
      event = JSON.parse(rawBody) as NewsletterWebhookEvent;
    } catch {
      throw new NotFoundException("Malformed webhook payload");
    }

    const email = event.data?.email?.toLowerCase();
    if (!email) return { handled: false };

    const recipient = event.data?.message_id
      ? await this.recipientRepository.findByProviderMessageId(event.data.message_id)
      : null;

    if (event.type === "email.delivered" && recipient) {
      recipient.deliveredAt = new Date();
      recipient.status = recipient.openedAt ? NewsletterRecipientStatus.OPENED : NewsletterRecipientStatus.DELIVERED;
      await this.recipientRepository.save(recipient);
      await this.eventRepository.record({
        newsletterId: recipient.newsletterId,
        recipientId: recipient.id,
        subscriberId: recipient.subscriberId ?? null,
        type: NewsletterEventType.DELIVERY,
      });
    } else if (event.type === "email.bounced" && recipient) {
      recipient.bouncedAt = new Date();
      recipient.status = NewsletterRecipientStatus.BOUNCED;
      await this.recipientRepository.save(recipient);
      await this.eventRepository.record({
        newsletterId: recipient.newsletterId,
        recipientId: recipient.id,
        subscriberId: recipient.subscriberId ?? null,
        type: NewsletterEventType.BOUNCE,
      });
    } else if (event.type === "email.complained" && recipient) {
      recipient.status = NewsletterRecipientStatus.COMPLAINED;
      recipient.unsubscribedAt = new Date();
      await this.recipientRepository.save(recipient);
      await this.eventRepository.record({
        newsletterId: recipient.newsletterId,
        recipientId: recipient.id,
        subscriberId: recipient.subscriberId ?? null,
        type: NewsletterEventType.COMPLAINT,
      });
    } else {
      this.logger.debug(`Ignoring unhandled newsletter webhook event: ${event.type}`);
      return { handled: false };
    }

    if (recipient) {
      await this.recipientRepository.refreshFromEvents(recipient.newsletterId);
    }

    if (event.type === "email.bounced") {
      await this.subscriberService.suppressAddress(email, NewsletterSubscriberStatus.BOUNCED);
    }
    if (event.type === "email.complained") {
      await this.subscriberService.suppressAddress(email, NewsletterSubscriberStatus.COMPLAINED);
    }

    return { handled: true };
  }

  /**
   * RFC 8058 one-click unsubscribe.
   *
   * Mail clients POST here directly from the `List-Unsubscribe` header, so the endpoint
   * must accept a POST without a session and must not require a GET first.
   */
  async oneClickUnsubscribe(token: string): Promise<UnsubscribeNewsletterResponse> {
    return await this.subscriberService.unsubscribe(token);
  }

  async getPreferences(token: string): Promise<ManageSubscriptionResponse> {
    return await this.subscriberService.getSubscription(token);
  }

  async updatePreferences(
    token: string,
    preferences: UpdateNewsletterPreferencesDto,
  ): Promise<ManageSubscriptionResponse> {
    return await this.subscriberService.updatePreferences(token, preferences);
  }

  /** Constant-time HMAC comparison against the provider's `t=<ts>,v1=<sig>` scheme. */
  private verifySignature(rawBody: string, signature: string): void {
    const parts = Object.fromEntries(
      signature
        .split(",")
        .map((part) => part.trim().split("="))
        .filter(([key, value]) => key && value) as [string, string][],
    );

    const timestamp = parts.t;
    const provided = parts.v1;

    if (!timestamp || !provided) {
      throw new NotFoundException("Missing webhook signature");
    }

    const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
      throw new NotFoundException("Webhook signature expired");
    }

    const expected = createHmac("sha256", this.webhookSecret as string)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const providedBuffer = Buffer.from(provided, "hex");

    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new NotFoundException("Invalid webhook signature");
    }
  }

  private async requireRecipient(recipientId: bigint): Promise<NewsletterRecipient> {
    const recipient = await this.recipientRepository.findById(recipientId);
    if (!recipient) {
      throw new NotFoundException("Unknown recipient");
    }
    return recipient;
  }
}
