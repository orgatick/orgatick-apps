import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  buildNewsletterStats,
  NewsletterAction,
  NewsletterStatus,
  toNewsletterResponse,
  type CreateNewsletterDto,
  type NewsletterContent,
  type NewsletterOverview,
  type NewsletterQueryDto,
  type NewsletterRecipientQueryDto,
  type NewsletterRecipientResponse,
  type NewsletterResponse,
  type UpdateNewsletterDto,
} from "@orgatick/contracts";
import { MailService } from "../../../infrastructure/mail/mail.service";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterCampaignActionsService } from "./newsletter-campaign-actions.service";
import { NewsletterCampaignReportService } from "./newsletter-campaign-report.service";
import { NewsletterDispatchService } from "./newsletter-dispatch.service";
import { NewsletterRenderService } from "./newsletter-render.service";
import { NewsletterSubscriberService } from "./newsletter-subscriber.service";
import { NewsletterTemplateService } from "./newsletter-template.service";
import type { NewsletterActor } from "../types/newsletter.types";

const EDITABLE: NewsletterStatus[] = [NewsletterStatus.DRAFT, NewsletterStatus.SCHEDULED];

@Injectable()
export class NewsletterCampaignService {
  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly templateService: NewsletterTemplateService,
    private readonly subscriberService: NewsletterSubscriberService,
    private readonly dispatchService: NewsletterDispatchService,
    private readonly actionsService: NewsletterCampaignActionsService,
    private readonly reportService: NewsletterCampaignReportService,
    private readonly renderService: NewsletterRenderService,
    private readonly mailService: MailService,
  ) {}

  async findAll(query: NewsletterQueryDto): Promise<{
    items: NewsletterResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [campaigns, total] = await this.newsletterRepository.findPaginated(query);
    return {
      items: campaigns.map((campaign) => toNewsletterResponse(campaign, buildNewsletterStats(campaign))),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async findOne(id: bigint): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);
    const stats = await this.reportService.refreshStats(campaign);
    return toNewsletterResponse(campaign, stats);
  }

  async findByUuid(uuid: string): Promise<Newsletter> {
    const campaign = await this.newsletterRepository.findByUuid(uuid);
    if (!campaign) throw new NotFoundException("Newsletter campaign not found");
    return campaign;
  }

  async create(dto: CreateNewsletterDto, actor: NewsletterActor): Promise<NewsletterResponse> {
    const list = await this.subscriberService.requireList(BigInt(dto.listId));
    if (!list.isActive) throw new BadRequestException("This mailing list is inactive");

    const template = dto.templateId ? await this.templateService.requireTemplate(BigInt(dto.templateId)) : null;
    if (template?.status === "archived") {
      throw new BadRequestException("An archived template cannot be attached to a campaign");
    }

    const content = dto.content ?? template?.content;
    if (!content?.length && !dto.htmlOverride && !template?.htmlOverride) {
      throw new BadRequestException("A campaign needs content blocks, a template or an HTML override");
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (scheduledAt && (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now())) {
      throw new BadRequestException("Scheduled time must be a valid future date");
    }

    const campaign = await this.newsletterRepository.create({
      listId: list.id,
      templateId: template?.id ?? null,
      name: dto.name ?? dto.subject,
      subject: dto.subject,
      previewText: dto.previewText ?? template?.previewText ?? null,
      content: (content ?? []) as NewsletterContent,
      htmlOverride: dto.htmlOverride ?? template?.htmlOverride ?? null,
      textOverride: dto.textOverride ?? null,
      audience: dto.audience ?? { categories: [], onlyRegisteredUsers: false },
      fromName: dto.fromName,
      fromEmail: dto.fromEmail,
      replyTo: dto.replyTo ?? null,
      scheduledAt,
      status: scheduledAt && !dto.sendNow ? NewsletterStatus.SCHEDULED : NewsletterStatus.DRAFT,
      createdBy: actor.id,
    });

    if (dto.sendNow) await this.dispatchService.queue(campaign, actor);
    return await this.findOne(campaign.id);
  }

  async update(id: bigint, dto: UpdateNewsletterDto, actor: NewsletterActor): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);
    if (!EDITABLE.includes(campaign.status)) {
      throw new BadRequestException(`A ${campaign.status} campaign can no longer be edited`);
    }

    if (dto.listId) campaign.listId = (await this.subscriberService.requireList(BigInt(dto.listId))).id;
    if (dto.templateId !== undefined) {
      campaign.templateId = dto.templateId
        ? (await this.templateService.requireTemplate(BigInt(dto.templateId))).id
        : null;
    }
    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.subject !== undefined) campaign.subject = dto.subject;
    if (dto.previewText !== undefined) campaign.previewText = dto.previewText;
    if (dto.content !== undefined) campaign.content = dto.content;
    if (dto.htmlOverride !== undefined) campaign.htmlOverride = dto.htmlOverride;
    if (dto.textOverride !== undefined) campaign.textOverride = dto.textOverride;
    if (dto.audience !== undefined) campaign.audience = dto.audience;
    if (dto.fromName !== undefined) campaign.fromName = dto.fromName;
    if (dto.fromEmail !== undefined) campaign.fromEmail = dto.fromEmail;
    if (dto.replyTo !== undefined) campaign.replyTo = dto.replyTo;
    campaign.updatedBy = actor.id;

    await this.newsletterRepository.save(campaign);
    return await this.findOne(id);
  }

  async performAction(
    id: bigint,
    action: NewsletterAction,
    options: { scheduledAt?: string; reason?: string },
    actor: NewsletterActor,
  ): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);
    await this.actionsService.performAction(campaign, action, options, actor);
    return await this.findOne(id);
  }

  async sendTestEmail(
    id: bigint,
    targetEmail: string,
    actor: NewsletterActor,
  ): Promise<{ sent: boolean; email: string }> {
    const campaign = await this.requireCampaign(id);
    const testContext = {
      recipientId: "0",
      firstName: actor.name.split(" ")[0] || "Admin",
      email: targetEmail,
      listName: campaign.list?.name ?? "Orgatick Newsletter",
      unsubscribeUrl: "#test-unsubscribe",
      preferencesUrl: "#test-preferences",
      viewInBrowserUrl: "#test-view",
    };

    const rendered = this.renderService.renderCampaign(campaign, testContext);
    await this.mailService.sendHtml({
      to: targetEmail,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      from: `${campaign.fromName} <${campaign.fromEmail}>`,
      replyTo: campaign.replyTo ?? undefined,
    });

    return { sent: true, email: targetEmail };
  }

  async duplicate(id: bigint, customName: string | undefined, actor: NewsletterActor): Promise<NewsletterResponse> {
    const source = await this.requireCampaign(id);
    const clone = await this.newsletterRepository.create({
      listId: source.listId,
      templateId: source.templateId,
      name: customName?.trim() || `${source.name} (Copy)`,
      subject: source.subject,
      previewText: source.previewText,
      content: source.content,
      htmlOverride: source.htmlOverride,
      textOverride: source.textOverride,
      audience: source.audience,
      fromName: source.fromName,
      fromEmail: source.fromEmail,
      replyTo: source.replyTo,
      scheduledAt: null,
      status: NewsletterStatus.DRAFT,
      createdBy: actor.id,
    });

    return await this.findOne(clone.id);
  }

  async remove(id: bigint): Promise<void> {
    const campaign = await this.requireCampaign(id);
    if (campaign.status === NewsletterStatus.SENDING) {
      throw new BadRequestException("Cancel the campaign before deleting it");
    }
    await this.newsletterRepository.remove(campaign.id);
  }

  findRecipients(
    id: bigint,
    query: NewsletterRecipientQueryDto,
  ): Promise<{
    items: NewsletterRecipientResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.reportService.findRecipients(id, query);
  }

  async overview(id: bigint): Promise<NewsletterOverview> {
    const campaign = await this.requireCampaign(id);
    return this.reportService.overview(campaign);
  }

  async preview(id: bigint): Promise<{ subject: string; html: string; text: string }> {
    const campaign = await this.requireCampaign(id);
    return this.reportService.preview(campaign);
  }

  async saveAsTemplate(id: bigint, name: string | undefined, actor: NewsletterActor): Promise<{ id: string }> {
    const campaign = await this.requireCampaign(id);
    return this.reportService.saveAsTemplate(campaign, name, actor);
  }

  async requireCampaign(id: bigint): Promise<Newsletter> {
    const campaign = await this.newsletterRepository.findById(id);
    if (!campaign) throw new NotFoundException("Newsletter campaign not found");
    return campaign;
  }
}
