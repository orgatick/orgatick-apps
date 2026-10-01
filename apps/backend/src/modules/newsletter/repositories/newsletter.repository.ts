import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  NewsletterStatus,
  type NewsletterAudienceDto,
  type NewsletterContent,
  type NewsletterQueryDto,
} from "@orgatick/contracts";
import { Newsletter } from "../entities/newsletter.entity";

const SORTABLE: Record<string, string> = {
  created_at: "newsletter.createdAt",
  scheduled_at: "newsletter.scheduledAt",
  sent_at: "newsletter.sentAt",
  subject: "newsletter.subject",
  id: "newsletter.id",
};

/** Statuses that mean delivery is under way, so the claim can be released. */
const DELIVERING = [NewsletterStatus.SENDING, NewsletterStatus.PAUSED];

@Injectable()
export class NewsletterRepository {
  constructor(
    @InjectRepository(Newsletter)
    private readonly repo: Repository<Newsletter>,
  ) {}

  findById(id: bigint): Promise<Newsletter | null> {
    return this.repo.findOne({
      where: { id },
      relations: { list: true, template: true, creator: true },
    });
  }

  findByUuid(uuid: string): Promise<Newsletter | null> {
    return this.repo.findOne({
      where: { uuid },
      relations: { list: true, template: true, creator: true },
    });
  }

  async findPaginated(query: NewsletterQueryDto) {
    const qb = this.repo
      .createQueryBuilder("newsletter")
      .leftJoinAndSelect("newsletter.list", "list")
      .leftJoinAndSelect("newsletter.template", "template")
      .leftJoinAndSelect("newsletter.creator", "creator");

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((where) => {
          where
            .where("LOWER(newsletter.subject) LIKE :search", { search })
            .orWhere("LOWER(newsletter.name) LIKE :search", { search });
        }),
      );
    }

    const statuses = normalizeStatuses(query.status);
    if (statuses.length > 0) {
      qb.andWhere("newsletter.status IN (:...statuses)", { statuses });
    }

    if (query.listId) {
      qb.andWhere("newsletter.listId = :listId", { listId: BigInt(query.listId) });
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

  save(newsletter: Newsletter): Promise<Newsletter> {
    return this.repo.save(newsletter);
  }

  create(data: {
    listId: bigint;
    templateId?: bigint | null;
    name: string;
    subject: string;
    previewText?: string | null;
    content: NewsletterContent;
    htmlOverride?: string | null;
    textOverride?: string | null;
    audience?: NewsletterAudienceDto;
    fromName: string;
    fromEmail: string;
    replyTo?: string | null;
    scheduledAt?: Date | null;
    status: NewsletterStatus;
    createdBy?: bigint | null;
  }): Promise<Newsletter> {
    return this.repo.save(
      this.repo.create({
        listId: data.listId,
        templateId: data.templateId ?? null,
        name: data.name,
        subject: data.subject,
        previewText: data.previewText ?? null,
        content: data.content,
        htmlOverride: data.htmlOverride ?? null,
        textOverride: data.textOverride ?? null,
        audience: data.audience ?? {},
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        replyTo: data.replyTo ?? null,
        scheduledAt: data.scheduledAt ?? null,
        status: data.status,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null,
        recipientCount: 0,
      }),
    );
  }

  /**
   * Claims a scheduled campaign by flipping it out of `scheduled` with a conditional
   * update, so two replicas racing on the same row cannot both start it.
   */
  async claimScheduled(id: bigint): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Newsletter)
      .set({ status: NewsletterStatus.SENDING, startedAt: new Date(), updatedAt: new Date() })
      .where("id = :id", { id })
      .andWhere("status = :status", { status: NewsletterStatus.SCHEDULED })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /** Conditional draft/scheduled -> sending flip, so two concurrent sends cannot both win. */
  async claimForSend(id: bigint): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Newsletter)
      .set({ status: NewsletterStatus.SENDING, startedAt: new Date(), errorMessage: null, updatedAt: new Date() })
      .where("id = :id", { id })
      .andWhere("status IN (:...statuses)", { statuses: [NewsletterStatus.DRAFT, NewsletterStatus.SCHEDULED] })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /**
   * Releases a campaign that was claimed for sending but never got a queue.
   *
   * Claiming and enqueueing are two separate statements, so a failure in between used to
   * strand the campaign in `sending` or `paused`, where no admin action could move it again.
   * Releasing the claim returns it to an editable state and keeps the reason visible.
   */
  async releaseStuckSend(id: bigint, reason: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Newsletter)
      .set({ status: NewsletterStatus.DRAFT, errorMessage: reason, updatedAt: new Date() })
      .where("id = :id", { id })
      .andWhere("status IN (:...statuses)", { statuses: DELIVERING })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  /** Writes the recomputed denormalised counters used by the admin list view. */
  async updateCounters(
    id: bigint,
    counters: {
      recipientCount: number;
      sentCount: number;
      deliveredCount: number;
      openedCount: number;
      clickedCount: number;
      bouncedCount: number;
      complainedCount: number;
      unsubscribedCount: number;
      failedCount: number;
    },
  ): Promise<void> {
    await this.repo.update(
      { id },
      {
        recipientCount: counters.recipientCount,
        deliveredCount: counters.deliveredCount,
        openedCount: counters.openedCount,
        clickedCount: counters.clickedCount,
        bouncedCount: counters.bouncedCount,
        complainedCount: counters.complainedCount,
        unsubscribedCount: counters.unsubscribedCount,
        failedCount: counters.failedCount,
      },
    );
  }

  remove(id: bigint): Promise<void> {
    return this.repo.delete({ id }).then(() => undefined);
  }

  findDueScheduled(now: Date, limit: number): Promise<Newsletter[]> {
    return this.repo
      .createQueryBuilder("newsletter")
      .where("newsletter.status = :status", { status: NewsletterStatus.SCHEDULED })
      .andWhere("newsletter.scheduledAt IS NOT NULL")
      .andWhere("newsletter.scheduledAt <= :now", { now })
      .orderBy("newsletter.scheduledAt", "ASC")
      .take(limit)
      .getMany();
  }

  findByStatus(status: NewsletterStatus, limit: number): Promise<Newsletter[]> {
    return this.repo.find({ where: { status }, order: { updatedAt: "ASC" }, take: limit });
  }
}

function normalizeStatuses(status?: NewsletterStatus | NewsletterStatus[]): string[] {
  if (!status) return [];
  return Array.isArray(status) ? status : [status];
}
