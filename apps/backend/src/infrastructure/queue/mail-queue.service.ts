import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job, JobsOptions, Queue } from "bullmq";
import { MAIL_QUEUE_CONFIG } from "../../config/mail-queue.config";
import type { SendHtmlOptions } from "../mail/mail.service";
import type { MailJobData } from "./mail-queue.types";
import { MAIL_JOB_SEND, MAIL_QUEUE } from "./queue.constants";

/** Deterministic per-recipient id, so the same recipient is never queued twice by accident. */
function campaignJobId(campaign: NonNullable<MailJobData["campaign"]>): string {
  const base = `news-${campaign.newsletterId}-rec-${campaign.recipientId}`;
  return campaign.retryNonce ? `${base}-r${campaign.retryNonce}` : base;
}

/**
 * Producer for outbound mail.
 *
 * Delivery runs through Redis rather than inside the request, so a slow provider, a rate
 * limit or a burst of lifecycle mail can never block an API response. Retries and backoff
 * are declared here, once, for every producer.
 */
@Injectable()
export class MailQueueService {
  private readonly logger = new Logger(MailQueueService.name);
  private readonly enabled: boolean;
  private readonly jobOptions: JobsOptions;

  constructor(@InjectQueue(MAIL_QUEUE) private readonly queue: Queue<MailJobData, unknown, string>) {
    this.enabled = MAIL_QUEUE_CONFIG.enabled;
    this.jobOptions = {
      attempts: MAIL_QUEUE_CONFIG.attempts,
      backoff: { type: "exponential", delay: MAIL_QUEUE_CONFIG.backoffMs },
      removeOnComplete: { count: MAIL_QUEUE_CONFIG.removeOnCompleteCount },
      removeOnFail: { count: MAIL_QUEUE_CONFIG.removeOnFailCount },
    };
  }

  /**
   * Queues one already rendered message.
   *
   * Use this for transactional mail such as password resets and for campaign messages that
   * were rendered up front.
   */
  async send(message: SendHtmlOptions): Promise<Job | null> {
    if (!this.enabled) {
      this.logger.warn("Mail queue disabled by configuration; dropping message");
      return null;
    }

    return await this.queue.add(MAIL_JOB_SEND, { message }, this.jobOptions);
  }

  /**
   * Queues campaign recipients for delivery.
   *
   * Each recipient gets a deterministic `jobId`, so re-queueing a campaign is a no-op while
   * the original job is still around. That, plus the unique (newsletter_id,
   * email_normalized) recipient index, is what stops a retried send from mailing twice.
   */
  async queueCampaignRecipients(
    recipients: { newsletterId: string; recipientId: string; retryNonce?: number }[],
  ): Promise<void> {
    if (recipients.length === 0) {
      return;
    }

    if (!this.enabled) {
      this.logger.warn(`Mail queue disabled by configuration; dropping ${recipients.length} campaign recipient(s)`);
      return;
    }

    await this.queue.addBulk(
      recipients.map((campaign) => ({
        name: MAIL_JOB_SEND,
        data: { campaign } satisfies MailJobData,
        opts: {
          ...this.jobOptions,
          jobId: campaignJobId(campaign),
        },
      })),
    );
  }
}
