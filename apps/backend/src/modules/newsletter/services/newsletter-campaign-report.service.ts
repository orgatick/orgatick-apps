import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  buildNewsletterStats,
  NewsletterTemplateStatus,
  toNewsletterRecipientResponse,
  type NewsletterOverview,
  type NewsletterRecipientQueryDto,
  type NewsletterRecipientResponse,
  type NewsletterStats,
} from "@orgatick/contracts";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterEventRepository } from "../repositories/newsletter-event.repository";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterRenderService } from "./newsletter-render.service";
import { NewsletterTemplateService } from "./newsletter-template.service";
import type { NewsletterActor } from "../types/newsletter.types";

@Injectable()
export class NewsletterCampaignReportService {
  private readonly trackingEnabled: boolean;

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly eventRepository: NewsletterEventRepository,
    private readonly templateService: NewsletterTemplateService,
    private readonly renderService: NewsletterRenderService,
    configService: ConfigService,
  ) {
    this.trackingEnabled = configService.get<string>("NEWSLETTER_TRACKING_ENABLED") === "true";
  }

  async findRecipients(
    id: bigint,
    query: NewsletterRecipientQueryDto,
  ): Promise<{
    items: NewsletterRecipientResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [recipients, total] = await this.recipientRepository.findPaginated(id, query);
    return {
      items: recipients.map((r) => toNewsletterRecipientResponse(r)),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async overview(campaign: Newsletter): Promise<NewsletterOverview> {
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

  async preview(campaign: Newsletter): Promise<{ subject: string; html: string; text: string }> {
    return this.renderService.previewCampaign(campaign, this.trackingEnabled);
  }

  async saveAsTemplate(
    campaign: Newsletter,
    name: string | undefined,
    actor: NewsletterActor,
  ): Promise<{ id: string }> {
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

  async refreshStats(campaign: Newsletter): Promise<NewsletterStats> {
    if (campaign.recipientCount === 0 && !campaign.sentAt && !campaign.completedAt) {
      return buildNewsletterStats(campaign);
    }
    const counts = await this.recipientRepository.statsFor(campaign.id);
    await this.newsletterRepository.updateCounters(campaign.id, counts);
    return buildNewsletterStats(counts);
  }
}
