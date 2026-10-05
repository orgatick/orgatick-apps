import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type Redis from "ioredis";
import { NewsletterRecipientStatus, NewsletterStatus, NewsletterSubscriberStatus } from "@orgatick/contracts";
import { MAIL_QUEUE_CONFIG } from "../../../config/mail-queue.config";
import { MailService } from "../../../infrastructure/mail/mail.service";
import { MailQueueService } from "../../../infrastructure/queue/mail-queue.service";
import { REDIS_CLIENT } from "../../../infrastructure/redis/redis.constants";
import {
  NEWSLETTER_DISPATCH_LOCK_KEY,
  NEWSLETTER_DISPATCH_LOCK_TTL_MS,
  NEWSLETTER_TAG_NAME,
} from "../constants/newsletter.constants";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterRenderService } from "./newsletter-render.service";
import { NewsletterTokenService } from "./newsletter-token.service";
import type { NewsletterActor, NewsletterRenderContext } from "../types/newsletter.types";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

/** Compare-and-delete so a slow holder cannot drop a lock that has already been retaken. */
const RELEASE_LOCK_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

/** Greeting for the `{{ first_name }}` merge tag. */
function firstNameOf(name?: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  return first ? first : "there";
}

/**
 * Prepares a campaign send: claims it, materialises its recipients and queues their mail.
 *
 * Nothing is sent from the request. The mail queue carries delivery, so a provider outage,
 * a rate limit or a large audience can never turn into a failed API call, and delivery state
 * lives in `newsletter_recipients` keyed on the (newsletter_id, email_normalized) unique
 * index so a restart or a second replica cannot resend an address.
 */
/** Recipients re-queued per campaign per repair pass, so one huge campaign cannot stall a tick. */
const MAX_REPAIRED_PER_CAMPAIGN = 500;

@Injectable()
export class NewsletterDispatchService {
  private readonly logger = new Logger(NewsletterDispatchService.name);
  private readonly maxRecipientsPerSend: number;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly tokenService: NewsletterTokenService,
    private readonly renderService: NewsletterRenderService,
    private readonly mailService: MailService,
    private readonly mailQueue: MailQueueService,
    configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.maxRecipientsPerSend = configService.getOrThrow<number>("NEWSLETTER_MAX_RECIPIENTS_PER_SEND");
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  /**
   * Marks a campaign as sending and materialises its recipient queue.
   *
   * The status flip is conditional, so two admins clicking "send" at the same time cannot
   * enqueue the campaign twice. Enqueueing is idempotent regardless, thanks to the unique
   * (newsletter_id, email_normalized) index.
   */
  async queue(campaign: Newsletter, actor: NewsletterActor): Promise<void> {
    void actor;

    await this.releaseIfQueueIsEmpty(campaign);

    if (!(await this.claimForSend(campaign))) {
      this.logger.warn(`Campaign ${String(campaign.id)} is already sending; ignoring duplicate send request`);
      return;
    }

    await this.enqueueSafely(campaign);
  }

  /**
   * Builds the queue for a campaign the scheduler already flipped to `sending`.
   *
   * Separated from `queue` so a scheduled send never re-runs the claim, which would fail
   * for a status the scheduler just wrote.
   */
  async queueFromSchedule(campaign: Newsletter): Promise<void> {
    await this.enqueueSafely(campaign);
  }

  /**
   * Enqueues the audience and releases the claim if it fails.
   *
   * Without this a broken enqueue leaves the campaign in `sending` with an empty queue,
   * which the scheduler cannot drain and no admin action can restart.
   */
  private async enqueueSafely(campaign: Newsletter): Promise<void> {
    try {
      await this.enqueueAudience(campaign);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.releaseStuckSend(campaign, message);
      throw error;
    }
  }

  /**
   * Reports a campaign that claims to be delivering but has no queue.
   *
   * `sending` or `paused` with zero queued recipients means an earlier attempt died between
   * the claim and the enqueue, so there is nothing in flight and the send can be restarted.
   */
  async isWedged(campaign: Newsletter): Promise<boolean> {
    if (![NewsletterStatus.SENDING, NewsletterStatus.PAUSED].includes(campaign.status)) {
      return false;
    }

    return (await this.recipientRepository.pendingCount(campaign.id)) === 0;
  }

  /**
   * Frees a campaign that is marked as delivering but has nothing queued.
   *
   * An empty queue means the previous claim never enqueued anyone, so there is no work to
   * protect and the send can be retried. A non-empty queue is left alone because the
   * scheduler is draining it.
   */
  private async releaseIfQueueIsEmpty(campaign: Newsletter): Promise<void> {
    if (!(await this.isWedged(campaign))) {
      return;
    }

    const wedgedStatus = campaign.status;

    if (await this.releaseStuckSend(campaign, "Previous send attempt never queued any recipients")) {
      campaign.status = NewsletterStatus.DRAFT;
      this.logger.warn(`Campaign ${String(campaign.id)} was ${wedgedStatus} with an empty queue; released for retry`);
    }
  }

  private async releaseStuckSend(campaign: Newsletter, reason: string): Promise<boolean> {
    const released = await this.newsletterRepository.releaseStuckSend(campaign.id, reason);
    if (released) {
      this.logger.error(`Campaign ${String(campaign.id)} left sending: ${reason}`);
    }
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
    if (recipientIds.length === 0) {
      campaign.completedAt = new Date();
    }
    await this.newsletterRepository.save(campaign);

    // One job per recipient. The queue carries delivery; Postgres carries the ledger.
    await this.mailQueue.queueCampaignRecipients(
      recipientIds.map((recipientId) => ({ newsletterId: String(campaign.id), recipientId: String(recipientId) })),
    );

    this.logger.log(`Campaign ${String(campaign.id)} queued for ${recipientIds.length} recipients`);
  }

  /** Picks up campaigns whose schedule has arrived. Called by the scheduler tick. */
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

  /** Puts previously failed recipients back onto the mail queue. */
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

  /**
   * Re-queues recipients whose mail job went missing.
   *
   * The database, not the queue, is the source of truth for delivery, so a job that was
   * evicted or removed would otherwise leave its recipient `queued` forever and strand the
   * campaign. Job ids are derived from the campaign and recipient, so re-adding a job that is
   * still alive is a no-op and only genuinely missing ones come back.
   */
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

  /**
   * Closes every sending campaign whose recipients have all reached a terminal state.
   *
   * Called from the scheduler tick as a safety net: the worker normally finalises the
   * campaign itself, but a job that is removed, retried forever or lost with a crashed
   * worker must not leave the campaign stuck in `sending`.
   */
  async finalizeDrainedCampaigns(limit: number): Promise<number> {
    const campaigns = await this.newsletterRepository.findByStatus(NewsletterStatus.SENDING, limit);
    let finalized = 0;

    for (const campaign of campaigns) {
      if ((await this.recipientRepository.pendingCount(campaign.id)) > 0) {
        continue;
      }

      await this.finalize(campaign);
      finalized += 1;
    }

    return finalized;
  }

  /**
   * Claims the dispatch lock.
   *
   * Only the holder of this Redis lock may drain queues, so several replicas can run the
   * same scheduler without double-sending. The lock is released by TTL, which also covers
   * a replica dying mid-batch.
   */
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
      // Only release our own lock: if the TTL expired, another replica may hold it now.
      await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, NEWSLETTER_DISPATCH_LOCK_KEY, token).catch(() => undefined);
    }
  }

  /** Closes a campaign once no queued recipients remain. */
  async finalize(campaign: Newsletter): Promise<void> {
    if (campaign.status !== NewsletterStatus.SENDING) {
      return;
    }

    const pending = await this.recipientRepository.pendingCount(campaign.id);
    if (pending > 0) {
      return;
    }

    const stats = await this.recipientRepository.statsFor(campaign.id);

    campaign.status = NewsletterStatus.SENT;
    campaign.completedAt = new Date();
    campaign.sentAt = campaign.sentAt ?? new Date();
    campaign.failedCount = stats.failedCount;
    await this.newsletterRepository.save(campaign);
    await this.recipientRepository.refreshFromEvents(campaign.id);

    this.logger.log(`Campaign ${String(campaign.id)} finished: ${JSON.stringify(stats)}`);
  }

  private async claimForSend(campaign: Newsletter): Promise<boolean> {
    if (campaign.status === NewsletterStatus.SENDING) {
      return false;
    }

    const result = await this.newsletterRepository.claimForSend(campaign.id);
    if (result) {
      campaign.status = NewsletterStatus.SENDING;
      campaign.startedAt = new Date();
      campaign.errorMessage = null;
    }
    return result;
  }

  /**
   * Renders and delivers one queued recipient. Called by the mail worker.
   *
   * Throws when the provider call fails, which is how BullMQ is told to retry with backoff.
   * The recipient is only marked failed once the attempts are exhausted, so a transient
   * outage does not lose the address.
   */
  async deliverRecipient(
    newsletterId: bigint,
    recipientId: bigint,
    options: { finalAttempt: boolean },
  ): Promise<{ providerMessageId: string | null }> {
    const campaign = await this.newsletterRepository.findById(newsletterId);

    if (!campaign || campaign.status !== NewsletterStatus.SENDING) {
      this.logger.warn(`Dropping recipient ${String(recipientId)}: campaign is ${campaign?.status ?? "missing"}`);
      return { providerMessageId: null };
    }

    const recipient = await this.recipientRepository.findById(recipientId);

    if (!recipient) {
      return { providerMessageId: null };
    }

    // Only still-queued work is delivered, so a retry cannot double-send.
    if (recipient.status !== NewsletterRecipientStatus.QUEUED) {
      this.logger.warn(`Skipping recipient ${String(recipientId)}: already ${recipient.status}`);
      return { providerMessageId: null };
    }

    await this.recipientRepository.markProcessing(recipient.id);

    const subscriber = recipient.subscriberId ? await this.subscriberRepository.findById(recipient.subscriberId) : null;

    // Re-checked at send time: an address may have unsubscribed while the campaign was queued.
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
          // RFC 8058: a single POST must be enough to unsubscribe.
          "List-Unsubscribe": `<${context.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [{ name: NEWSLETTER_TAG_NAME, value: String(campaign.id) }],
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const providerMessageId = response.data?.id ?? null;
      await this.recipientRepository.markSent(recipient.id, providerMessageId, NewsletterRecipientStatus.SENT);
      await this.finalize(campaign);

      return { providerMessageId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Re-queue and let BullMQ retry, unless this was the last attempt.
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

  /**
   * Self-service links are minted at send time.
   *
   * Tokens are deterministic HMACs over the subscriber uuid, so the footer link needs no
   * database lookup and keeps working years after the send.
   */
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
