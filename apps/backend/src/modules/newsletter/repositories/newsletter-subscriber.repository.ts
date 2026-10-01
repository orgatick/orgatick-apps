import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  NewsletterSubscriberStatus,
  type NewsletterAudienceDto,
  type NewsletterSubscriberQueryDto,
} from "@orgatick/contracts";
import { NewsletterSubscriber } from "../entities/newsletter-subscriber.entity";

const SORTABLE: Record<string, string> = {
  created_at: "subscriber.createdAt",
  confirmed_at: "subscriber.confirmedAt",
  email: "subscriber.emailNormalized",
  name: "subscriber.name",
  id: "subscriber.id",
};

export interface NewsletterAudienceSelection {
  listId: bigint;
  audience?: NewsletterAudienceDto;
}

@Injectable()
export class NewsletterSubscriberRepository {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  findById(id: bigint): Promise<NewsletterSubscriber | null> {
    return this.repo.findOne({ where: { id }, relations: { list: true } });
  }

  findByUuid(uuid: string): Promise<NewsletterSubscriber | null> {
    return this.repo.findOne({ where: { uuid }, relations: { list: true } });
  }

  findByListAndEmail(listId: bigint, emailNormalized: string): Promise<NewsletterSubscriber | null> {
    return this.repo.findOne({ where: { listId, emailNormalized } });
  }

  findByConfirmationHash(hash: string): Promise<NewsletterSubscriber | null> {
    return this.repo.findOne({ where: { confirmationTokenHash: hash }, relations: { list: true } });
  }

  findByUnsubscribeHash(hash: string): Promise<NewsletterSubscriber | null> {
    return this.repo.findOne({ where: { unsubscribeTokenHash: hash }, relations: { list: true } });
  }

  async findPaginated(query: NewsletterSubscriberQueryDto) {
    const qb = this.repo.createQueryBuilder("subscriber").leftJoinAndSelect("subscriber.list", "list");

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((where) => {
          where
            .where("subscriber.emailNormalized LIKE :search", { search })
            .orWhere("LOWER(subscriber.name) LIKE :search", { search });
        }),
      );
    }

    const statuses = normalizeStatuses(query.status);
    if (statuses.length > 0) {
      qb.andWhere("subscriber.status IN (:...statuses)", { statuses });
    }

    if (query.listId) {
      qb.andWhere("subscriber.listId = :listId", { listId: BigInt(query.listId) });
    }

    const sortColumn = SORTABLE[query.sortBy] ?? SORTABLE.created_at;
    const direction = query.sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return qb
      .orderBy(sortColumn, direction)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async countByStatus(listId?: bigint): Promise<Record<NewsletterSubscriberStatus, number>> {
    const qb = this.repo
      .createQueryBuilder("subscriber")
      .select("subscriber.status", "status")
      .addSelect("COUNT(*)", "count");

    if (listId) {
      qb.where("subscriber.listId = :listId", { listId });
    }

    const rows = await qb.groupBy("subscriber.status").getRawMany<{ status: string; count: string }>();
    const counts = {
      [NewsletterSubscriberStatus.PENDING]: 0,
      [NewsletterSubscriberStatus.SUBSCRIBED]: 0,
      [NewsletterSubscriberStatus.UNSUBSCRIBED]: 0,
      [NewsletterSubscriberStatus.BOUNCED]: 0,
      [NewsletterSubscriberStatus.COMPLAINED]: 0,
    } as Record<NewsletterSubscriberStatus, number>;

    for (const row of rows) {
      if (row.status in counts) {
        counts[row.status as NewsletterSubscriberStatus] = Number(row.count);
      }
    }

    return counts;
  }

  save(subscriber: NewsletterSubscriber): Promise<NewsletterSubscriber> {
    return this.repo.save(subscriber);
  }

  /**
   * Selects the subscribers a campaign should reach.
   *
   * Runs in the database rather than in Node so a large list never has to be
   * materialised in memory before the queue insert.
   */
  selectAudienceIds(selection: NewsletterAudienceSelection): Promise<bigint[]> {
    const { listId, audience } = selection;
    const qb = this.repo
      .createQueryBuilder("subscriber")
      .select("subscriber.id", "id")
      .where("subscriber.listId = :listId", { listId })
      .andWhere("subscriber.status = :status", { status: NewsletterSubscriberStatus.SUBSCRIBED });

    if (audience?.subscribedAfter) {
      qb.andWhere("COALESCE(subscriber.confirmedAt, subscriber.createdAt) >= :after", {
        after: new Date(audience.subscribedAfter),
      });
    }

    if (audience?.subscribedBefore) {
      qb.andWhere("COALESCE(subscriber.confirmedAt, subscriber.createdAt) <= :before", {
        before: new Date(audience.subscribedBefore),
      });
    }

    if (audience?.categories && audience.categories.length > 0) {
      // A subscriber with no categories selected receives everything.
      qb.andWhere(
        `(
          jsonb_array_length(COALESCE(subscriber.preferences->'categories', '[]'::jsonb)) = 0
          OR (subscriber.preferences->'categories') ?| ARRAY[:...categories]::text[]
        )`,
        { categories: audience.categories },
      );
    }

    if (audience?.onlyRegisteredUsers) {
      qb.andWhere("subscriber.userId IS NOT NULL");
    }

    qb.orderBy("subscriber.id", "ASC");

    const limit = audience?.limit;
    if (limit) {
      qb.limit(limit);
    }

    return qb.getRawMany<{ id: string }>().then((rows) => rows.map((row) => BigInt(row.id)));
  }

  /** Bulk flags addresses as undeliverable after a bounce or a spam complaint. */
  async suppress(emailNormalized: string, status: NewsletterSubscriberStatus): Promise<void> {
    await this.repo.update(
      { emailNormalized, status: NewsletterSubscriberStatus.SUBSCRIBED },
      {
        status,
        unsubscribedAt: status === NewsletterSubscriberStatus.UNSUBSCRIBED ? new Date() : null,
        bouncedAt: status === NewsletterSubscriberStatus.BOUNCED ? new Date() : null,
        complainedAt: status === NewsletterSubscriberStatus.COMPLAINED ? new Date() : null,
      },
    );
  }
}

function normalizeStatuses(status?: NewsletterSubscriberStatus | NewsletterSubscriberStatus[]): string[] {
  if (!status) return [];
  return Array.isArray(status) ? status : [status];
}
