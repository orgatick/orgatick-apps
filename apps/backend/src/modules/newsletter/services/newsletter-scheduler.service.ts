import { Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterDispatchService } from "./newsletter-dispatch.service";

/** Campaigns picked up per tick when their schedule time has passed. */
const MAX_SCHEDULED_PER_TICK = 20;

/** Sending campaigns repaired and finalised per tick. Keeps one tick's runtime bounded. */
const MAX_RECONCILE_PER_TICK = 10;
const MAX_FINALIZE_PER_TICK = 10;

/** After this many failed ticks in a row, stop logging each one. */
const FAILURE_LOG_EVERY = 20;

/**
 * Renders an error with its code, so a socket failure reads as `read ENETUNREACH (ENETUNREACH)`
 * instead of a bare message that says nothing about which dependency broke.
 */
function describeError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code ? `${error.message} (${code})` : error.message;
  }

  return String(error);
}

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
  private consecutiveFailures = 0;

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
        // Repair first: a campaign can only be finalised once nothing is left queued.
        await this.reconcileInFlightCampaigns();
        await this.finalizeDrainedCampaigns();
      });
      this.reportRecovered();
    } catch (error) {
      this.reportFailure(error);
    } finally {
      this.ticking = false;
    }
  }

  /**
   * Reports a failed tick.
   *
   * The lock lives in Redis, so a network blip fails the whole pass. That is transient by nature,
   * which is why only the first failure in a run is logged in full and the rest are counted: a
   * Redis outage must not bury the log with one line every interval.
   */
  private reportFailure(error: unknown): void {
    this.consecutiveFailures += 1;
    const detail = describeError(error);

    if (this.consecutiveFailures === 1) {
      this.logger.warn(`Newsletter scheduler tick failed, will retry next tick: ${detail}`);
    } else if (this.consecutiveFailures % FAILURE_LOG_EVERY === 0) {
      this.logger.warn(`${this.consecutiveFailures} consecutive failed ticks, last error: ${detail}`);
    }
  }

  /** Logs once when a failing run recovers, so an outage has a visible end. */
  private reportRecovered(): void {
    if (this.consecutiveFailures === 0) return;

    this.logger.log(`Newsletter scheduler recovered after ${this.consecutiveFailures} failed tick(s)`);
    this.consecutiveFailures = 0;
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

  /** Re-queues recipients whose queue job was lost, for example evicted by Redis. */
  private async reconcileInFlightCampaigns(): Promise<void> {
    const repaired = await this.dispatchService.reconcileInFlightCampaigns(MAX_RECONCILE_PER_TICK);

    if (repaired > 0) {
      this.logger.warn(`Re-queued ${repaired} recipient(s) whose mail job was missing`);
    }
  }

  /**
   * Closes campaigns whose recipients are all done.
   *
   * The mail queue delivers the messages, so the scheduler's remaining job is the schedule
   * itself plus this reconciliation, which repairs a campaign whose last job vanished.
   */
  private async finalizeDrainedCampaigns(): Promise<void> {
    const finalized = await this.dispatchService.finalizeDrainedCampaigns(MAX_FINALIZE_PER_TICK);

    if (finalized > 0) {
      this.logger.log(`Finalised ${finalized} campaign(s) with no pending recipients`);
    }
  }
}
