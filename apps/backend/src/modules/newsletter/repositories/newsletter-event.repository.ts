import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsletterEventType } from "@orgatick/contracts";
import { NewsletterEvent } from "../entities/newsletter-event.entity";

export interface RecordNewsletterEventInput {
  newsletterId: bigint;
  recipientId?: bigint | null;
  subscriberId?: bigint | null;
  type: NewsletterEventType;
  url?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class NewsletterEventRepository {
  constructor(
    @InjectRepository(NewsletterEvent)
    private readonly repo: Repository<NewsletterEvent>,
  ) {}

  record(input: RecordNewsletterEventInput): Promise<NewsletterEvent> {
    return this.repo.save(this.repo.create({ ...input, url: input.url ?? null }));
  }

  /** Batch insert used by the provider webhook so a burst of callbacks is one round trip. */
  recordMany(inputs: RecordNewsletterEventInput[]): Promise<NewsletterEvent[]> {
    if (inputs.length === 0) {
      return Promise.resolve([]);
    }
    return this.repo.save(inputs.map((input) => this.repo.create({ ...input, url: input.url ?? null })));
  }

  /** Most-clicked destinations for a campaign, used by the engagement report. */
  async topLinks(newsletterId: bigint, limit: number): Promise<{ url: string; count: number }[]> {
    const rows = await this.repo
      .createQueryBuilder("event")
      .select("event.url", "url")
      .addSelect("COUNT(*)", "count")
      .where("event.newsletterId = :newsletterId", { newsletterId })
      .andWhere("event.type = :type", { type: NewsletterEventType.CLICK })
      .andWhere("event.url IS NOT NULL")
      .groupBy("event.url")
      .orderBy("COUNT(*)", "DESC")
      .limit(limit)
      .getRawMany<{ url: string; count: string }>();

    return rows.map((row) => ({ url: row.url, count: Number(row.count) }));
  }

  /** Sends per day for the trend chart on the campaign report. */
  /**
   * Send activity per day, taken from the recipient queue rather than the campaign row so
   * a send that spans midnight or resumes after a pause is reported across every day.
   */
  async sendsByDay(newsletterId: bigint, days: number): Promise<{ date: string; count: number }[]> {
    const rows = await this.repo.manager.query(
      `SELECT to_char(DATE_TRUNC('day', sent_at), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM "newsletter"."newsletter_recipients"
       WHERE newsletter_id = $1 AND sent_at IS NOT NULL AND sent_at > NOW() - ($2 || ' days')::interval
       GROUP BY 1
       ORDER BY 1 ASC`,
      [newsletterId.toString(), String(days)],
    );

    return (rows as { date: string; count: number }[]).map((row) => ({ date: row.date, count: Number(row.count) }));
  }

  /** Distinct click sources, used to render the "links clicked" table. */
  async clickCount(newsletterId: bigint, url: string): Promise<number> {
    return this.repo.count({ where: { newsletterId, type: NewsletterEventType.CLICK, url } });
  }
}
