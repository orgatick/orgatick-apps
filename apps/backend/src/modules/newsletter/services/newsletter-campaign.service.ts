import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  buildNewsletterStats,
  NewsletterAction,
  NewsletterStatus,
  NewsletterTemplateStatus,
  toNewsletterRecipientResponse,
  toNewsletterResponse,
  type CreateNewsletterDto,
  type NewsletterContent,
  type NewsletterOverview,
  type NewsletterQueryDto,
  type NewsletterRecipientQueryDto,
  type NewsletterRecipientResponse,
  type NewsletterResponse,
  type NewsletterStats,
  type UpdateNewsletterDto,
} from "@orgatick/contracts";
import { NEWSLETTER_MAX_SEND_ATTEMPTS } from "../constants/newsletter.constants";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterEventRepository } from "../repositories/newsletter-event.repository";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterDispatchService } from "./newsletter-dispatch.service";
import { NewsletterRenderService } from "./newsletter-render.service";
import { NewsletterSubscriberService } from "./newsletter-subscriber.service";
import { NewsletterTemplateService } from "./newsletter-template.service";
import type { NewsletterActor } from "../types/newsletter.types";

/** Statuses in which a campaign may still be edited or queued. */
const EDITABLE: NewsletterStatus[] = [NewsletterStatus.DRAFT, NewsletterStatus.SCHEDULED];

@Injectable()
export class NewsletterCampaignService {
  private readonly trackingEnabled: boolean;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly eventRepository: NewsletterEventRepository,
    private readonly templateService: NewsletterTemplateService,
    private readonly subscriberService: NewsletterSubscriberService,
    private readonly dispatchService: NewsletterDispatchService,
    private readonly renderService: NewsletterRenderService,
    configService: ConfigService,
  ) {
    this.trackingEnabled = configService.get<string>("NEWSLETTER_TRACKING_ENABLED") === "true";
  }

  async findAll(query: NewsletterQueryDto): Promise<{
    items: NewsletterResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [campaigns, total] = await this.newsletterRepository.findPaginated(query);

    return {
      items: campaigns.map((campaign) => toNewsletterResponse(campaign, buildNewsletterStats(campaign))),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: bigint): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);
    return toNewsletterResponse(campaign, await this.refreshStats(campaign));
  }

  async create(dto: CreateNewsletterDto, actor: NewsletterActor): Promise<NewsletterResponse> {
    const list = await this.subscriberService.requireList(BigInt(dto.listId));
    if (!list.isActive) {
      throw new BadRequestException("This mailing list is inactive");
    }

    const template = dto.templateId ? await this.templateService.requireTemplate(BigInt(dto.templateId)) : null;
    if (template?.status === "archived") {
      throw new BadRequestException("An archived template cannot be attached to a campaign");
    }

    const content = dto.content ?? template?.content;
    if (!content?.length && !dto.htmlOverride && !template?.htmlOverride) {
      throw new BadRequestException("A campaign needs content blocks, a template or an HTML override");
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException("Scheduled time is invalid");
    }
    if (scheduledAt && scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException("Scheduled time must be in the future");
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

    if (dto.sendNow) {
      await this.dispatchService.queue(campaign, actor);
    }

    return await this.findOne(campaign.id);
  }

  async update(id: bigint, dto: UpdateNewsletterDto, actor: NewsletterActor): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);

    if (!EDITABLE.includes(campaign.status)) {
      throw new BadRequestException(`A ${campaign.status} campaign can no longer be edited`);
    }

    if (dto.listId) {
      campaign.listId = (await this.subscriberService.requireList(BigInt(dto.listId))).id;
    }

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

  /**
   * Applies a lifecycle transition.
   *
   * Sending is asynchronous: the recipient queue is built and drained by the dispatcher,
   * so an HTTP request never blocks on thousands of emails.
   */
  async performAction(
    id: bigint,
    action: NewsletterAction,
    options: { scheduledAt?: string; reason?: string },
    actor: NewsletterActor,
  ): Promise<NewsletterResponse> {
    const campaign = await this.requireCampaign(id);
    campaign.updatedBy = actor.id;

    switch (action) {
      case NewsletterAction.SEND: {
        // A campaign left in a delivering state with an empty queue has nothing in flight,
        // so sending restarts it instead of reporting a state the operator cannot escape.
        const wedged = await this.dispatchService.isWedged(campaign);
        if (!EDITABLE.includes(campaign.status) && !wedged) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be sent`);
        }
        await this.dispatchService.queue(campaign, actor);
        break;
      }
      case NewsletterAction.SCHEDULE:
      case NewsletterAction.RESCHEDULE: {
        if (!EDITABLE.includes(campaign.status)) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be scheduled`);
        }
        if (!options.scheduledAt) {
          throw new BadRequestException("A schedule time is required");
        }
        const scheduledAt = new Date(options.scheduledAt);
        if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
          throw new BadRequestException("Scheduled time must be a future date");
        }
        campaign.scheduledAt = scheduledAt;
        campaign.status = NewsletterStatus.SCHEDULED;
        campaign.errorMessage = null;
        break;
      }
      case NewsletterAction.PAUSE: {
        if (campaign.status !== NewsletterStatus.SENDING) {
          throw new BadRequestException("Only a sending campaign can be paused");
        }
        campaign.status = NewsletterStatus.PAUSED;
        break;
      }
      case NewsletterAction.RESUME: {
        if (campaign.status !== NewsletterStatus.PAUSED) {
          throw new BadRequestException("Only a paused campaign can be resumed");
        }
        campaign.status = NewsletterStatus.SENDING;
        break;
      }
      case NewsletterAction.CANCEL: {
        if (campaign.status === NewsletterStatus.SENT || campaign.status === NewsletterStatus.CANCELLED) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be cancelled`);
        }
        campaign.status = NewsletterStatus.CANCELLED;
        campaign.cancelledAt = new Date();
        await this.cancelQueuedRecipients(campaign);
        break;
      }
      case NewsletterAction.RETRY_FAILED: {
        if (![NewsletterStatus.SENT, NewsletterStatus.FAILED, NewsletterStatus.PAUSED].includes(campaign.status)) {
          throw new BadRequestException("Only a completed, failed or paused campaign can retry failed recipients");
        }
        const requeued = await this.recipientRepository.requeueFailed(campaign.id, NEWSLETTER_MAX_SEND_ATTEMPTS);
        if (requeued === 0) {
          throw new BadRequestException("There are no failed recipients left to retry");
        }
        campaign.status = NewsletterStatus.SENDING;
        campaign.completedAt = null;
        campaign.failedCount = 0;
        break;
      }
      default:
        throw new BadRequestException("Unsupported campaign action");
    }

    await this.newsletterRepository.save(campaign);
    return await this.findOne(id);
  }

  async remove(id: bigint): Promise<void> {
    const campaign = await this.requireCampaign(id);
    if (campaign.status === NewsletterStatus.SENDING) {
      throw new BadRequestException("Cancel the campaign before deleting it");
    }
    await this.newsletterRepository.remove(campaign.id);
  }

  async findRecipients(
    id: bigint,
    query: NewsletterRecipientQueryDto,
  ): Promise<{
    items: NewsletterRecipientResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    await this.requireCampaign(id);
    const [recipients, total] = await this.recipientRepository.findPaginated(id, query);

    return {
      items: recipients.map((recipient) => toNewsletterRecipientResponse(recipient)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /** Aggregated report: counters, status breakdown, top links and a send trend. */
  async overview(id: bigint): Promise<NewsletterOverview> {
    const campaign = await this.requireCampaign(id);
    const stats = await this.refreshStats(campaign);
    const [statusBreakdown, topLinks] = await Promise.all([
      this.recipientRepository.countByStatus(campaign.id),
      this.eventRepository.topLinks(campaign.id, 10),
    ]);

    return {
      stats,
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      topLinks,
      sendsByDay: await this.eventRepository.sendsByDay(campaign.id, 30),
    };
  }

  /** Renders the campaign exactly as a recipient would see it, minus tracking. */
  async preview(id: bigint): Promise<{ subject: string; html: string; text: string }> {
    const campaign = await this.requireCampaign(id);

    return this.renderService.previewCampaign(campaign, this.trackingEnabled);
  }

  /** Copies a campaign into a reusable draft template. */
  /** Copies a campaign into a draft template, defaulting the name to the subject line. */
  async saveAsTemplate(id: bigint, name: string | undefined, actor: NewsletterActor): Promise<{ id: string }> {
    const campaign = await this.requireCampaign(id);
    const template = await this.templateService.create(
      {
        name: name?.trim() || `${campaign.subject} (template)`,
        subject: campaign.subject,
        previewText: campaign.previewText ?? undefined,
        content: campaign.content,
        htmlOverride: campaign.htmlOverride ?? undefined,
        status: NewsletterTemplateStatus.DRAFT,
      },
      actor.id,
    );

    return { id: template.id };
  }

  async requireCampaign(id: bigint): Promise<Newsletter> {
    const campaign = await this.newsletterRepository.findById(id);
    if (!campaign) {
      throw new NotFoundException("Newsletter campaign not found");
    }
    return campaign;
  }

  /**
   * Recomputes the denormalised campaign counters from the recipient rows.
   *
   * Reports are read far more often than they change, so the aggregate is written once
   * per read request instead of on every single delivery event.
   */
  private async refreshStats(campaign: Newsletter): Promise<NewsletterStats> {
    if (campaign.recipientCount === 0 && !campaign.sentAt && !campaign.completedAt) {
      return buildNewsletterStats(campaign);
    }

    const counts = await this.recipientRepository.statsFor(campaign.id);

    await this.newsletterRepository.updateCounters(campaign.id, counts);

    return buildNewsletterStats(counts);
  }

  private async cancelQueuedRecipients(campaign: Newsletter): Promise<void> {
    await this.recipientRepository.skipPending(campaign.id);
  }
}
