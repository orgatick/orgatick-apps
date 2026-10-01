import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import {
  NewsletterTemplateStatus,
  type CreateNewsletterTemplateDto,
  type NewsletterTemplateQueryDto,
} from "@orgatick/contracts";
import { NewsletterTemplate } from "../entities/newsletter-template.entity";

const SORTABLE: Record<string, string> = {
  created_at: "template.createdAt",
  name: "template.name",
  id: "template.id",
};

@Injectable()
export class NewsletterTemplateRepository {
  constructor(
    @InjectRepository(NewsletterTemplate)
    private readonly repo: Repository<NewsletterTemplate>,
  ) {}

  findById(id: bigint): Promise<NewsletterTemplate | null> {
    return this.repo.findOne({ where: { id }, relations: { creator: true } });
  }

  async findPaginated(query: NewsletterTemplateQueryDto) {
    const qb = this.repo.createQueryBuilder("template").leftJoinAndSelect("template.creator", "creator");

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((where) => {
          where
            .where("LOWER(template.name) LIKE :search", { search })
            .orWhere("LOWER(template.subject) LIKE :search", { search });
        }),
      );
    }

    if (query.status) {
      qb.andWhere("template.status = :status", { status: query.status });
    }

    if (query.category) {
      qb.andWhere("template.category = :category", { category: query.category });
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

  findActive(): Promise<NewsletterTemplate[]> {
    return this.repo.find({ where: { status: NewsletterTemplateStatus.ACTIVE }, order: { name: "ASC" } });
  }

  save(template: NewsletterTemplate): Promise<NewsletterTemplate> {
    return this.repo.save(template);
  }

  create(data: CreateNewsletterTemplateDto, createdBy?: bigint | null): Promise<NewsletterTemplate> {
    return this.repo.save(
      this.repo.create({
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? null,
        subject: data.subject,
        previewText: data.previewText ?? null,
        content: data.content,
        htmlOverride: data.htmlOverride ?? null,
        status: data.status,
        createdBy: createdBy ?? null,
        updatedBy: createdBy ?? null,
      }),
    );
  }

  remove(id: bigint): Promise<void> {
    return this.repo.delete({ id }).then(() => undefined);
  }

  /** Usage count per template id, so the list view can show how often each one was reused. */
  async usageCounts(templateIds: bigint[]): Promise<Map<string, number>> {
    if (templateIds.length === 0) return new Map();

    const rows = await this.repo.manager.query(
      `SELECT template_id AS "templateId", COUNT(*)::int AS count
       FROM "newsletter"."newsletters"
       WHERE template_id = ANY($1::bigint[])
       GROUP BY template_id`,
      [templateIds.map((id) => id.toString())],
    );

    return new Map<string, number>(
      (rows as { templateId: string; count: number }[]).map((row) => [String(row.templateId), Number(row.count)]),
    );
  }
}
