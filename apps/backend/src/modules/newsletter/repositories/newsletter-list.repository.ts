import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NewsletterListScope, type CreateNewsletterListDto, type UpdateNewsletterListDto } from "@orgatick/contracts";
import { NewsletterList } from "../entities/newsletter-list.entity";

@Injectable()
export class NewsletterListRepository {
  constructor(
    @InjectRepository(NewsletterList)
    private readonly repo: Repository<NewsletterList>,
  ) {}

  findBySlug(slug: string): Promise<NewsletterList | null> {
    return this.repo.findOne({ where: { slug } });
  }

  findById(id: bigint): Promise<NewsletterList | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAll(): Promise<NewsletterList[]> {
    return this.repo.find({ order: { isDefault: "DESC", name: "ASC" } });
  }

  findDefault(): Promise<NewsletterList | null> {
    return this.repo.findOne({
      where: [
        { isDefault: true, isActive: true },
        { scope: NewsletterListScope.PLATFORM, isActive: true },
      ],
      order: { isDefault: "DESC", createdAt: "ASC" },
    });
  }

  save(list: NewsletterList): Promise<NewsletterList> {
    return this.repo.save(list);
  }

  create(data: CreateNewsletterListDto): Promise<NewsletterList> {
    return this.repo.save(
      this.repo.create({
        name: data.name,
        slug: data.slug ?? slugify(data.name),
        description: data.description ?? null,
        scope: data.organizationId ? NewsletterListScope.ORGANIZATION : NewsletterListScope.PLATFORM,
        organizationId: data.organizationId ? BigInt(data.organizationId) : null,
        isDefault: false,
        isActive: true,
      }),
    );
  }

  async update(id: bigint, data: UpdateNewsletterListDto): Promise<NewsletterList | null> {
    const list = await this.repo.findOne({ where: { id } });
    if (!list) return null;

    if (data.name !== undefined) list.name = data.name;
    if (data.description !== undefined) list.description = data.description;
    if (data.isActive !== undefined) list.isActive = data.isActive;

    return this.repo.save(list);
  }

  async remove(id: bigint): Promise<void> {
    await this.repo.delete({ id });
  }

  /** Clears the default flag everywhere, then promotes a single list. */
  async makeDefault(id: bigint): Promise<void> {
    await this.repo.update({ isDefault: true }, { isDefault: false });
    await this.repo.update({ id }, { isDefault: true });
  }

  /** Live subscriber count per list, computed in one grouped query. */
  async countsByList(): Promise<Map<string, number>> {
    const rows = await this.repo
      .createQueryBuilder("list")
      .leftJoin(
        "newsletter_subscribers",
        "subscriber",
        "subscriber.list_id = list.id AND subscriber.status = :status",
        {
          status: "subscribed",
        },
      )
      .select("list.id", "id")
      .addSelect("COUNT(subscriber.id)", "count")
      .groupBy("list.id")
      .getRawMany<{ id: string; count: string }>();

    return new Map(rows.map((row) => [row.id, Number(row.count)]));
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
