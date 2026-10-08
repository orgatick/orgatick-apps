import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { NewsletterRecipientStatus, type NewsletterRecipientQueryDto } from "@orgatick/contracts";
import { NewsletterRecipient } from "../entities/newsletter-recipient.entity";
import {
  NewsletterRecipientStatsRepository,
  type RecipientStatsSummary,
} from "./newsletter-recipient-stats.repository";

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
    private readonly statsRepo: NewsletterRecipientStatsRepository,
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

  async enqueue(newsletterId: bigint, subscriberIds: bigint[]): Promise<bigint[]> {
    if (subscriberIds.length === 0) return [];

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

    return Array.isArray(result) ? result.map((row: { id: string }) => BigInt(row.id)) : [];
  }

  async findStaleQueuedIds(newsletterId: bigint, queuedBefore: Date, limit: number): Promise<bigint[]> {
    const rows = await this.repo
      .createQueryBuilder("recipient")
      .select("recipient.id", "id")
      .where("recipient.newsletter_id = :newsletterId", { newsletterId: String(newsletterId) })
      .andWhere("recipient.status = :status", { status: NewsletterRecipientStatus.QUEUED })
      .andWhere("recipient.queued_at < :queuedBefore", { queuedBefore })
      .orderBy("recipient.queued_at", "ASC")
      .limit(limit)
      .getRawMany<{ id: string }>();

    return rows.map((row) => BigInt(row.id));
  }

  async requeueFailed(newsletterId: bigint): Promise<bigint[]> {
    const requeued = await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({ status: NewsletterRecipientStatus.QUEUED, lastError: null, queuedAt: new Date() })
      .where("newsletter_id = :newsletterId", { newsletterId })
      .andWhere("status = :status", { status: NewsletterRecipientStatus.FAILED })
      .returning("id")
      .execute();

    return (requeued.raw as { id: string }[]).map((row) => BigInt(row.id));
  }

  async markProcessing(id: bigint): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NewsletterRecipient)
      .set({ status: NewsletterRecipientStatus.PROCESSING })
      .where("id = :id", { id })
      .set({ attemptCount: () => '"attempt_count" + 1' })
      .execute();
  }

  async markQueued(id: bigint, error: string): Promise<void> {
    await this.repo.update(
      { id },
      { status: NewsletterRecipientStatus.QUEUED, lastError: error.slice(0, 2000), queuedAt: new Date() },
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

  countByStatus(newsletterId: bigint): Promise<Record<string, number>> {
    return this.statsRepo.countByStatus(newsletterId);
  }

  pendingCount(newsletterId: bigint): Promise<number> {
    return this.statsRepo.pendingCount(newsletterId);
  }

  statsFor(newsletterId: bigint): Promise<RecipientStatsSummary> {
    return this.statsRepo.statsFor(newsletterId);
  }

  refreshFromEvents(newsletterId: bigint): Promise<void> {
    return this.statsRepo.refreshFromEvents(newsletterId);
  }

  findByNewsletterAndStatus(
    newsletterId: bigint,
    statuses: NewsletterRecipientStatus[],
  ): Promise<NewsletterRecipient[]> {
    return this.repo.find({ where: { newsletterId, status: In(statuses) } });
  }

  async incrementClickCount(id: bigint): Promise<void> {
    await this.repo.increment({ id }, "clickCount", 1);
  }

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
