import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { MAIL_QUEUE_CONFIG } from "../../../config/mail-queue.config";
import type { MailJobData } from "../../../infrastructure/queue/mail-queue.types";
import { MAIL_JOB_SEND, MAIL_QUEUE } from "../../../infrastructure/queue/queue.constants";
import { NewsletterDispatchService } from "../services/newsletter-dispatch.service";

/**
 * Worker for campaign mail.
 *
 * Rendering happens at send time rather than at queue time, so unsubscribe preferences, the
 * first-name merge tag and tracking links reflect the moment the message actually leaves.
 * Throwing is how a retry is requested, so a transient provider error is retried with
 * backoff instead of silently dropping the recipient.
 */
@Processor(MAIL_QUEUE, { concurrency: MAIL_QUEUE_CONFIG.concurrency })
export class NewsletterMailProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsletterMailProcessor.name);

  constructor(private readonly dispatchService: NewsletterDispatchService) {
    super();
  }

  async process(job: Job<MailJobData, unknown, string>): Promise<{ providerMessageId: string | null }> {
    switch (job.name) {
      case MAIL_JOB_SEND: {
        if (!job.data.campaign) {
          throw new Error("Campaign mail job is missing its campaign reference");
        }

        const attempts = job.opts.attempts ?? 1;

        return await this.dispatchService.deliverRecipient(
          BigInt(job.data.campaign.newsletterId),
          BigInt(job.data.campaign.recipientId),
          {
            // attemptsMade counts finished tries, so the next one is the last when they match.
            finalAttempt: job.attemptsMade + 1 >= attempts,
          },
        );
      }
      default:
        this.logger.error(`Unsupported mail job "${job.name}"`);
        throw new Error(`Unsupported mail job "${job.name}"`);
    }
  }
}
