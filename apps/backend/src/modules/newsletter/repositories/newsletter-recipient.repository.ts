import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { NewsletterRecipientStatus, type NewsletterRecipientQueryDto } from "@orgatick/contracts";
import { NewsletterRecipient } from "../entities/newsletter-recipient.entity";

const SORTABLE: Record<string, string> = {
  created_at: "recipient.createdAt",
  sent_at: "recipient.sentAt",
  opened_at: "recipient.openedAt",
  email: "recipient.emailNormalized",
};

@Injectable()
export class NewsletterRecipientRepository {
  constructor(
    @InjectRepository(NewsletterRecipient)
    private readonly repo: Repository<NewsletterRecipient>,
  ) {}

  findById(id: bigint): Promise<NewsletterRecipient | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByProviderMessageId(providerMessageId: string): Promise<NewsletterRecipient | null> {
    return this.repo.findOne({ where: { providerMessageId } });
  }

  async findPaginated(newsletterId: bigint, query: NewsletterRecipientQueryDto) {
    const qb = this.repo
      .createQueryBuilder("recipient")
      .where("recipient.newsletterId = :newsletterId", { newsletterId });

    if (query.status) {
      qb.andWhere("recipient.status = :status", { status: query.status });
    }

    if (query.search) {
      qb.andWhere("recipient.emailNormalized LIKE :search", { search: `%${query.search.toLowerCase()}%` });
    }

    const sortColumn = SORTABLE[query.sortBy] ?? SORTABLE.created_at;
    const direction = (query.sortOrder ?? "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return qb
      .orderBy(sortColumn, direction)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  /**
   * Builds the recipient queue for a campaign.
   *
   * Done entirely in SQL with `ON CONFLICT DO NOTHING`, so it is idempotent and can be
   * re-run safely after a crash without duplicating recipients.
   */
  async enqueue(newsletterId: bigint, subscriberIds: bigint[]): Promise<number> {
    if (subscriberIds.length === 0) return 0;

    // Positional placeholders: node-postgres rejects the `:name` form.
    const result = await this.repo.manager.query(
      `INSERT INTO "newsletter"."newsletter_recipients"
         (newsletter_id, subscriber_id, email, email_normalized, status, queued_at, created_at)
       SELECT $1, s.id, s.email, s.email_normalized, $2, NOW(), NOW()
       FROM "newsletter"."newsletter_subscribers" s
       WHERE s.id = ANY($3::bigint[])
       ON CONFLICT (newsletter_id, email_normalized) DO NOTHING
       RETURNING id`,
      [newsletterId.toString(), NewsletterRecipientStatus.QUEUED, subscriberIds.map((id) => id.toString())],
    );

    return Array.isArray(result) ? result.length : 0;
  }

  /** Re-queues failed recipients for a retry, bounded by the attempt limit. */
  async requeueFailed(newsletterId: bigint, maxAttempts: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({ status: NewsletterRecipientStatus.QUEUED, lastError: null, queuedAt: new Date() })
      .where("newsletter_id = :newsletterId", { newsletterId })
      .andWhere("status = :status", { status: NewsletterRecipientStatus.FAILED })
      .andWhere("attempt_count < :maxAttempts", { maxAttempts })
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Claims the next batch of queued recipients.
   *
   * `FOR UPDATE SKIP LOCKED` lets several replicas drain the same campaign queue
   * concurrently without handing out the same row twice.
   */
  async claimBatch(newsletterId: bigint, batchSize: number): Promise<NewsletterRecipient[]> {
    const rows = await this.repo.manager.query(
      `WITH claimed AS (
         SELECT id FROM "newsletter"."newsletter_recipients"
         WHERE newsletter_id = $1 AND status = $2
         ORDER BY id ASC
         LIMIT $3
         FOR UPDATE SKIP LOCKED
       )
       UPDATE "newsletter"."newsletter_recipients" r
       SET status = $4, attempt_count = r.attempt_count + 1
       FROM claimed
       WHERE r.id = claimed.id
       RETURNING r.id, r.newsletter_id, r.subscriber_id, r.email, r.email_normalized, r.status,
                 r.attempt_count, r.created_at`,
      [newsletterId.toString(), NewsletterRecipientStatus.QUEUED, batchSize, NewsletterRecipientStatus.SENT],
    );

    return rows.map(
      (row: {
        id: string;
        newsletter_id: string;
        subscriber_id: string | null;
        email: string;
        email_normalized: string;
        status: NewsletterRecipientStatus;
        attempt_count: number;
        created_at: Date;
      }) =>
        this.repo.create({
          id: BigInt(row.id),
          newsletterId: BigInt(row.newsletter_id),
          subscriberId: row.subscriber_id ? BigInt(row.subscriber_id) : null,
          email: row.email,
          emailNormalized: row.email_normalized,
          status: row.status,
          attemptCount: row.attempt_count,
          createdAt: row.created_at,
        }),
    );
  }

  async markSent(id: bigint, providerMessageId: string | null, status: NewsletterRecipientStatus): Promise<void> {
    await this.repo.update(
      { id },
      {
        status,
        providerMessageId,
        sentAt: status === NewsletterRecipientStatus.FAILED ? null : new Date(),
        lastError: status === NewsletterRecipientStatus.FAILED ? "send rejected by provider" : null,
      },
    );
  }

  async markFailed(id: bigint, error: string): Promise<void> {
    await this.repo.update({ id }, { status: NewsletterRecipientStatus.FAILED, lastError: error.slice(0, 2000) });
  }

  async countByStatus(newsletterId: bigint): Promise<Record<string, number>> {
    const rows = await this.repo
      .createQueryBuilder("recipient")
      .select("recipient.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("recipient.newsletterId = :newsletterId", { newsletterId })
      .groupBy("recipient.status")
      .getRawMany<{ status: string; count: string }>();

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.status] = Number(row.count);
    }
    return counts;
  }

  /** Remaining work for a campaign: queued rows plus rows still in flight. */
  async pendingCount(newsletterId: bigint): Promise<number> {
    return this.repo
      .createQueryBuilder("recipient")
      .where("recipient.newsletterId = :newsletterId", { newsletterId })
      .andWhere("recipient.status IN (:...statuses)", {
        statuses: [NewsletterRecipientStatus.QUEUED, NewsletterRecipientStatus.SENT],
      })
      .getCount();
  }

  /** Recomputes the denormalised campaign counters from the recipient rows. */
  async statsFor(newsletterId: bigint): Promise<{
    recipientCount: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    bouncedCount: number;
    complainedCount: number;
    unsubscribedCount: number;
    failedCount: number;
  }> {
    const rows = await this.repo
      .createQueryBuilder("recipient")
      .select("recipient.status", "status")
      .addSelect("COUNT(*)", "count")
      .addSelect("COUNT(*) FILTER (WHERE recipient.opened_at IS NOT NULL)", "opened")
      .addSelect("COUNT(*) FILTER (WHERE recipient.clicked_at IS NOT NULL)", "clicked")
      .where("recipient.newsletterId = :newsletterId", { newsletterId })
      .groupBy("recipient.status")
      .getRawMany<{ status: string; count: string; opened: string; clicked: string }>();

    const stats = {
      recipientCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bouncedCount: 0,
      complainedCount: 0,
      unsubscribedCount: 0,
      failedCount: 0,
    };

    for (const row of rows) {
      const count = Number(row.count);
      const opened = Number(row.opened);
      const clicked = Number(row.clicked);

      stats.recipientCount += count;
      stats.openedCount += opened;
      stats.clickedCount += clicked;

      switch (row.status as NewsletterRecipientStatus) {
        case NewsletterRecipientStatus.SENT:
        case NewsletterRecipientStatus.DELIVERED:
        case NewsletterRecipientStatus.OPENED:
        case NewsletterRecipientStatus.CLICKED:
          stats.sentCount += count;
          stats.deliveredCount += count;
          break;
        case NewsletterRecipientStatus.BOUNCED:
          stats.sentCount += count;
          stats.bouncedCount += count;
          break;
        case NewsletterRecipientStatus.COMPLAINED:
          stats.sentCount += count;
          stats.complainedCount += count;
          break;
        case NewsletterRecipientStatus.UNSUBSCRIBED:
          stats.sentCount += count;
          stats.unsubscribedCount += count;
          break;
        case NewsletterRecipientStatus.FAILED:
          stats.failedCount += count;
          break;
        default:
          break;
      }
    }

    return stats;
  }

  /** Opens that have not been reported by the provider yet still count as delivered. */
  async refreshFromEvents(newsletterId: bigint): Promise<void> {
    await this.repo.manager.query(
      `UPDATE "newsletter"."newsletters" n
       SET delivered_count = COALESCE(s.delivered, 0),
           opened_count = COALESCE(s.opened, 0),
           clicked_count = COALESCE(s.clicked, 0),
           bounced_count = COALESCE(s.bounced, 0),
           complained_count = COALESCE(s.complained, 0),
           unsubscribed_count = COALESCE(s.unsubscribed, 0),
           failed_count = COALESCE(s.failed, 0),
           recipient_count = COALESCE(s.total, 0)
       FROM (
         SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status IN ('sent','delivered','opened','clicked')) AS delivered,
           COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
           COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS clicked,
           COUNT(*) FILTER (WHERE status = 'bounced') AS bounced,
           COUNT(*) FILTER (WHERE status = 'complained') AS complained,
           COUNT(*) FILTER (WHERE status = 'unsubscribed') AS unsubscribed,
           COUNT(*) FILTER (WHERE status = 'failed') AS failed
         FROM "newsletter"."newsletter_recipients"
         WHERE newsletter_id = $1
       ) s
       WHERE n.id = $1`,
      [newsletterId.toString()],
    );
  }

  findByNewsletterAndStatus(
    newsletterId: bigint,
    statuses: NewsletterRecipientStatus[],
  ): Promise<NewsletterRecipient[]> {
    return this.repo.find({
      where: { newsletterId, status: In(statuses) },
    });
  }

  /** Increments the click counter. Clicks are counted per tracked redirect. */
  async incrementClickCount(id: bigint): Promise<void> {
    await this.repo.increment({ id }, "clickCount", 1);
  }

  /**
   * Records the first open for a recipient in a single statement.
   *
   * The `opened_at IS NULL` guard makes the transition atomic, so concurrent pixel
   * fetches from Apple Mail cannot inflate `open_count`. Returns false when the open was
   * already recorded, and the caller should then skip the event insert.
   */
  async markOpened(id: bigint): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({
        openedAt: new Date(),
        status: NewsletterRecipientStatus.OPENED,
        openCount: () => '"open_count" + 1',
      })
      .where("id = :id", { id: id.toString() })
      .andWhere("opened_at IS NULL")
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /**
   * Moves a recipient into the clicked state exactly once.
   *
   * The counter is incremented separately because every tracked redirect is a distinct
   * click worth attributing, while the status only records the first one.
   */
  async markClickedIfFirst(id: bigint): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({ clickedAt: new Date(), status: NewsletterRecipientStatus.CLICKED })
      .where("id = :id", { id: id.toString() })
      .andWhere("clicked_at IS NULL")
      .execute();

    return (result.affected ?? 0) > 0;
  }

  update(id: bigint, partial: Partial<NewsletterRecipient>): Promise<void> {
    return this.repo.update({ id }, partial).then(() => undefined);
  }

  save(recipient: NewsletterRecipient): Promise<NewsletterRecipient> {
    return this.repo.save(recipient);
  }

  /** Stops delivery for every recipient that has not been handed to the provider yet. */
  async skipPending(newsletterId: bigint): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({ status: NewsletterRecipientStatus.SKIPPED })
      .where("newsletter_id = :newsletterId", { newsletterId })
      .andWhere("status IN (:...statuses)", {
        statuses: [NewsletterRecipientStatus.QUEUED, NewsletterRecipientStatus.SENT],
      })
      .execute();

    return result.affected ?? 0;
  }
}
