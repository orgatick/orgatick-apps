import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  NewsletterTemplateStatus,
  toNewsletterTemplateResponse,
  type CreateNewsletterTemplateDto,
  type NewsletterTemplateQueryDto,
  type NewsletterTemplateResponse,
  type UpdateNewsletterTemplateDto,
} from "@orgatick/contracts";
import { NewsletterTemplate } from "../entities/newsletter-template.entity";
import { NewsletterTemplateRepository } from "../repositories/newsletter-template.repository";

@Injectable()
export class NewsletterTemplateService {
  constructor(private readonly templateRepository: NewsletterTemplateRepository) {}

  async findAll(query: NewsletterTemplateQueryDto): Promise<{
    items: NewsletterTemplateResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [templates, total] = await this.templateRepository.findPaginated(query);
    const usageCounts = await this.templateRepository.usageCounts(templates.map((template) => template.id));

    return {
      items: templates.map((template) =>
        toNewsletterTemplateResponse(template, usageCounts.get(String(template.id)) ?? 0),
      ),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findActive(): Promise<NewsletterTemplateResponse[]> {
    const templates = await this.templateRepository.findActive();
    return templates.map((template) => toNewsletterTemplateResponse(template));
  }

  async findOne(id: bigint): Promise<NewsletterTemplateResponse> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException("Newsletter template not found");
    }

    const usageCounts = await this.templateRepository.usageCounts([template.id]);
    return toNewsletterTemplateResponse(template, usageCounts.get(String(template.id)) ?? 0);
  }

  async create(dto: CreateNewsletterTemplateDto, actorId?: bigint | null): Promise<NewsletterTemplateResponse> {
    if (!dto.content?.length && !dto.htmlOverride) {
      throw new BadRequestException("A template needs either content blocks or an HTML override");
    }

    const created = await this.templateRepository.create(dto, actorId);
    return toNewsletterTemplateResponse(created);
  }

  async update(
    id: bigint,
    dto: UpdateNewsletterTemplateDto,
    actorId?: bigint | null,
  ): Promise<NewsletterTemplateResponse> {
    const template = await this.requireTemplate(id);

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.subject !== undefined) template.subject = dto.subject;
    if (dto.previewText !== undefined) template.previewText = dto.previewText;
    if (dto.content !== undefined) template.content = dto.content;
    if (dto.htmlOverride !== undefined) template.htmlOverride = dto.htmlOverride;
    if (dto.status !== undefined) template.status = dto.status;

    template.updatedBy = actorId ?? template.updatedBy;

    if (template.status === NewsletterTemplateStatus.ARCHIVED && !template.content?.length && !template.htmlOverride) {
      throw new BadRequestException("A template needs either content blocks or an HTML override");
    }

    const saved = await this.templateRepository.save(template);
    return toNewsletterTemplateResponse(saved);
  }

  /** Publishing is a separate step so a draft can never be attached to a live campaign. */
  async publish(id: bigint, actorId?: bigint | null): Promise<NewsletterTemplateResponse> {
    return await this.update(id, { status: NewsletterTemplateStatus.ACTIVE }, actorId);
  }

  async archive(id: bigint, actorId?: bigint | null): Promise<NewsletterTemplateResponse> {
    return await this.update(id, { status: NewsletterTemplateStatus.ARCHIVED }, actorId);
  }

  async remove(id: bigint): Promise<void> {
    await this.requireTemplate(id);
    await this.templateRepository.remove(id);
  }

  async requireTemplate(id: bigint): Promise<NewsletterTemplate> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException("Newsletter template not found");
    }
    return template;
  }
}
