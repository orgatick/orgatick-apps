import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsletterRecipientStatus } from "@orgatick/contracts";
import { NewsletterRecipient } from "../entities/newsletter-recipient.entity";

export interface RecipientStatsSummary {
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  complainedCount: number;
  unsubscribedCount: number;
  failedCount: number;
}

@Injectable()
export class NewsletterRecipientStatsRepository {
  constructor(
    @InjectRepository(NewsletterRecipient)
    private readonly repo: Repository<NewsletterRecipient>,
  ) {}

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

  async pendingCount(newsletterId: bigint): Promise<number> {
    return this.repo
      .createQueryBuilder("recipient")
      .where("recipient.newsletterId = :newsletterId", { newsletterId })
      .andWhere("recipient.status IN (:...statuses)", {
        statuses: [NewsletterRecipientStatus.QUEUED, NewsletterRecipientStatus.PROCESSING],
      })
      .getCount();
  }

  async statsFor(newsletterId: bigint): Promise<RecipientStatsSummary> {
    const rows = await this.repo
      .createQueryBuilder("recipient")
      .select("recipient.status", "status")
      .addSelect("COUNT(*)", "count")
      .addSelect("COUNT(*) FILTER (WHERE recipient.opened_at IS NOT NULL)", "opened")
      .addSelect("COUNT(*) FILTER (WHERE recipient.clicked_at IS NOT NULL)", "clicked")
      .where("recipient.newsletterId = :newsletterId", { newsletterId })
      .groupBy("recipient.status")
      .getRawMany<{ status: string; count: string; opened: string; clicked: string }>();

    const stats: RecipientStatsSummary = {
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
        case NewsletterRecipientStatus.BOUNCED:
        case NewsletterRecipientStatus.COMPLAINED:
        case NewsletterRecipientStatus.UNSUBSCRIBED:
          stats.sentCount += count;
          if (
            row.status !== NewsletterRecipientStatus.BOUNCED &&
            row.status !== NewsletterRecipientStatus.COMPLAINED &&
            row.status !== NewsletterRecipientStatus.UNSUBSCRIBED
          ) {
            stats.deliveredCount += count;
          } else if (row.status === NewsletterRecipientStatus.BOUNCED) {
            stats.bouncedCount += count;
          } else if (row.status === NewsletterRecipientStatus.COMPLAINED) {
            stats.complainedCount += count;
          } else if (row.status === NewsletterRecipientStatus.UNSUBSCRIBED) {
            stats.unsubscribedCount += count;
          }
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
}
