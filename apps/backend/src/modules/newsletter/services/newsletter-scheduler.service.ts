import { Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NewsletterStatus } from "@orgatick/contracts";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterDispatchService } from "./newsletter-dispatch.service";

/** Campaigns picked up per tick when their schedule time has passed. */
const MAX_SCHEDULED_PER_TICK = 20;

/** Batches drained per campaign per tick. Keeps one tick's runtime bounded. */
const MAX_BATCHES_PER_TICK = 4;

/**
 * Drives campaign delivery.
 *
 * A plain interval is enough here: the queue lives in Postgres and a short Redis lock
 * makes the tick safe across replicas, so no broker has to be operated just to send
 * newsletters. Swap the interval for a queue consumer if delivery ever needs to scale
 * independently of the API.
 */
@Injectable()
export class NewsletterSchedulerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(NewsletterSchedulerService.name);
  private readonly intervalMs: number;
  private readonly enabled: boolean;
  private timer: NodeJS.Timeout | null = null;
  private ticking = false;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly dispatchService: NewsletterDispatchService,
    configService: ConfigService,
  ) {
    this.enabled = configService.get<string>("NEWSLETTER_ENABLED") === "true";
    this.intervalMs = configService.getOrThrow<number>("NEWSLETTER_DISPATCH_INTERVAL_MS");
  }

  onApplicationBootstrap(): void {
    if (!this.enabled) {
      this.logger.log("Newsletter scheduler disabled by configuration");
      return;
    }

    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);

    // Do not hold the event loop open for the scheduler.
    this.timer.unref?.();
    this.logger.log(`Newsletter scheduler started, ticking every ${this.intervalMs}ms`);
  }

  onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * One scheduler pass.
   *
   * `withDispatchLock` guarantees a single worker across replicas, and the `ticking` flag
   * prevents a slow pass from overlapping with the next interval.
   */
  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;

    try {
      await this.dispatchService.withDispatchLock(async () => {
        await this.dispatchDueScheduled();
        await this.drainSendingCampaigns();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Newsletter scheduler tick failed: ${message}`);
    } finally {
      this.ticking = false;
    }
  }

  /** Moves campaigns whose schedule has arrived into the sending state. */
  private async dispatchDueScheduled(): Promise<void> {
    const claimed = await this.dispatchService.claimDueScheduled(new Date(), MAX_SCHEDULED_PER_TICK);

    for (const newsletterId of claimed) {
      const campaign = await this.newsletterRepository.findById(newsletterId);
      if (!campaign) continue;

      await this.dispatchService.queueFromSchedule(campaign);
      this.logger.log(`Scheduled campaign ${String(newsletterId)} started`);
    }
  }

  /** Sends batches for every campaign that is currently sending. */
  private async drainSendingCampaigns(): Promise<void> {
    const campaigns = await this.newsletterRepository.findByStatus(NewsletterStatus.SENDING, 10);

    for (const campaign of campaigns) {
      for (let batch = 0; batch < MAX_BATCHES_PER_TICK; batch += 1) {
        const hasMore = await this.dispatchService.dispatchBatch(campaign.id);
        if (!hasMore) break;
      }
    }
  }
}
