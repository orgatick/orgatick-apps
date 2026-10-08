import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type Redis from "ioredis";
import { NewsletterStatus } from "@orgatick/contracts";
import { MAIL_QUEUE_CONFIG } from "../../../config/mail-queue.config";
import { MailQueueService } from "../../../infrastructure/queue/mail-queue.service";
import { REDIS_CLIENT } from "../../../infrastructure/redis/redis.constants";
import { NEWSLETTER_DISPATCH_LOCK_KEY, NEWSLETTER_DISPATCH_LOCK_TTL_MS } from "../constants/newsletter.constants";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterDeliveryService } from "./newsletter-delivery.service";
import type { NewsletterActor } from "../types/newsletter.types";

const RELEASE_LOCK_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;
const MAX_REPAIRED_PER_CAMPAIGN = 500;

@Injectable()
export class NewsletterDispatchService {
  private readonly logger = new Logger(NewsletterDispatchService.name);
  private readonly maxRecipientsPerSend: number;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly deliveryService: NewsletterDeliveryService,
    private readonly mailQueue: MailQueueService,
    configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.maxRecipientsPerSend = configService.getOrThrow<number>("NEWSLETTER_MAX_RECIPIENTS_PER_SEND");
  }

  async queue(campaign: Newsletter, actor: NewsletterActor): Promise<void> {
    void actor;
    await this.releaseIfQueueIsEmpty(campaign);

    if (!(await this.claimForSend(campaign))) {
      this.logger.warn(`Campaign ${String(campaign.id)} is already sending; ignoring duplicate send request`);
      return;
    }

    await this.enqueueSafely(campaign);
  }

  async queueFromSchedule(campaign: Newsletter): Promise<void> {
    await this.enqueueSafely(campaign);
  }

  private async enqueueSafely(campaign: Newsletter): Promise<void> {
    try {
      await this.enqueueAudience(campaign);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.releaseStuckSend(campaign, message);
      throw error;
    }
  }

  async isWedged(campaign: Newsletter): Promise<boolean> {
    if (![NewsletterStatus.SENDING, NewsletterStatus.PAUSED].includes(campaign.status)) {
      return false;
    }
    return (await this.recipientRepository.pendingCount(campaign.id)) === 0;
  }

  private async releaseIfQueueIsEmpty(campaign: Newsletter): Promise<void> {
    if (!(await this.isWedged(campaign))) return;

    const wedgedStatus = campaign.status;
    if (await this.releaseStuckSend(campaign, "Previous send attempt never queued any recipients")) {
      campaign.status = NewsletterStatus.DRAFT;
      this.logger.warn(`Campaign ${String(campaign.id)} was ${wedgedStatus} with an empty queue; released for retry`);
    }
  }

  private async releaseStuckSend(campaign: Newsletter, reason: string): Promise<boolean> {
    const released = await this.newsletterRepository.releaseStuckSend(campaign.id, reason);
    if (released) this.logger.error(`Campaign ${String(campaign.id)} left sending: ${reason}`);
    return released;
  }

  private async enqueueAudience(campaign: Newsletter): Promise<void> {
    const audience = {
      ...(campaign.audience ?? {}),
      limit: Math.min(campaign.audience?.limit ?? this.maxRecipientsPerSend, this.maxRecipientsPerSend),
    };

    const subscriberIds = await this.subscriberRepository.selectAudienceIds({
      listId: campaign.listId,
      audience,
    });

    const recipientIds = await this.recipientRepository.enqueue(campaign.id, subscriberIds);
    campaign.status = recipientIds.length === 0 ? NewsletterStatus.SENT : NewsletterStatus.SENDING;
    campaign.startedAt = campaign.startedAt ?? new Date();
    campaign.recipientCount = recipientIds.length;
    if (recipientIds.length === 0) campaign.completedAt = new Date();
    await this.newsletterRepository.save(campaign);

    await this.mailQueue.queueCampaignRecipients(
      recipientIds.map((recipientId) => ({ newsletterId: String(campaign.id), recipientId: String(recipientId) })),
    );

    this.logger.log(`Campaign ${String(campaign.id)} queued for ${recipientIds.length} recipients`);
  }

  async claimDueScheduled(now: Date, limit: number): Promise<bigint[]> {
    const due = await this.newsletterRepository.findDueScheduled(now, limit);
    const claimed: bigint[] = [];

    for (const campaign of due) {
      if (await this.newsletterRepository.claimScheduled(campaign.id)) {
        claimed.push(campaign.id);
      }
    }
    return claimed;
  }

  async requeueRecipients(campaign: Newsletter, recipientIds: bigint[]): Promise<void> {
    const retryNonce = Date.now();
    await this.mailQueue.queueCampaignRecipients(
      recipientIds.map((recipientId) => ({
        newsletterId: String(campaign.id),
        recipientId: String(recipientId),
        retryNonce,
      })),
    );
    this.logger.log(`Campaign ${String(campaign.id)} re-queued ${recipientIds.length} failed recipients`);
  }

  async reconcileInFlightCampaigns(limit: number): Promise<number> {
    const campaigns = await this.newsletterRepository.findByStatus(NewsletterStatus.SENDING, limit);
    const queuedBefore = new Date(Date.now() - MAIL_QUEUE_CONFIG.reconcileGraceMs);
    let repaired = 0;

    for (const campaign of campaigns) {
      const stale = await this.recipientRepository.findStaleQueuedIds(
        campaign.id,
        queuedBefore,
        MAX_REPAIRED_PER_CAMPAIGN,
      );
      if (stale.length === 0) continue;

      await this.mailQueue.queueCampaignRecipients(
        stale.map((recipientId) => ({ newsletterId: String(campaign.id), recipientId: String(recipientId) })),
      );
      repaired += stale.length;
      this.logger.warn(
        `Re-queued ${stale.length} recipient(s) of campaign ${String(campaign.id)}: their mail job was lost`,
      );
    }

    return repaired;
  }

  async finalizeDrainedCampaigns(limit: number): Promise<number> {
    const campaigns = await this.newsletterRepository.findByStatus(NewsletterStatus.SENDING, limit);
    let finalized = 0;

    for (const campaign of campaigns) {
      const remaining = await this.recipientRepository.pendingCount(campaign.id);
      if (remaining === 0) {
        await this.deliveryService.finalize(campaign);
        finalized++;
      }
    }

    return finalized;
  }

  async withDispatchLock<T>(work: () => Promise<T>): Promise<T | null> {
    const token = `${process.pid}-${Date.now()}`;
    const acquired = await this.redis.set(
      NEWSLETTER_DISPATCH_LOCK_KEY,
      token,
      "PX",
      NEWSLETTER_DISPATCH_LOCK_TTL_MS,
      "NX",
    );

    if (acquired !== "OK") {
      return null;
    }

    try {
      return await work();
    } finally {
      await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, NEWSLETTER_DISPATCH_LOCK_KEY, token).catch(() => undefined);
    }
  }

  deliverRecipient(
    newsletterId: bigint,
    recipientId: bigint,
    options: { finalAttempt: boolean },
  ): Promise<{ providerMessageId: string | null }> {
    return this.deliveryService.deliverRecipient(newsletterId, recipientId, options);
  }

  finalize(campaign: Newsletter): Promise<void> {
    return this.deliveryService.finalize(campaign);
  }

  private async claimForSend(campaign: Newsletter): Promise<boolean> {
    const lockToken = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const acquired = await this.acquireDispatchLock(campaign.id, lockToken);
    if (!acquired) return false;

    try {
      return await this.newsletterRepository.claimForSend(campaign.id);
    } finally {
      await this.releaseDispatchLock(campaign.id, lockToken);
    }
  }

  private async acquireDispatchLock(newsletterId: bigint, token: string): Promise<boolean> {
    const key = `${NEWSLETTER_DISPATCH_LOCK_KEY}:${String(newsletterId)}`;
    const result = await this.redis.set(key, token, "PX", NEWSLETTER_DISPATCH_LOCK_TTL_MS, "NX");
    return result === "OK";
  }

  private async releaseDispatchLock(newsletterId: bigint, token: string): Promise<void> {
    const key = `${NEWSLETTER_DISPATCH_LOCK_KEY}:${String(newsletterId)}`;
    try {
      await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, key, token);
    } catch (error) {
      this.logger.warn(`Failed to release send lock for campaign ${String(newsletterId)}: ${String(error)}`);
    }
  }
}
