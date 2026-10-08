import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  NewsletterStatus,
  SubscribeNewsletterSchema,
  type ManageSubscriptionResponse,
  type PublicNewsletterCampaignResponse,
  type SubscribeNewsletterDto,
  type SubscribeNewsletterResponse,
  type UnsubscribeNewsletterResponse,
  UpdateNewsletterPreferencesSchema,
  type UpdateNewsletterPreferencesDto,
} from "@orgatick/contracts";
import { Public } from "../../../common/decorators/public.decorator";
import { RateLimit } from "../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { NEWSLETTER_RATE_LIMIT_POLICIES } from "../../../infrastructure/rate-limit/constants/policies/newsletter.policy";
import { NEWSLETTER_OPEN_PIXEL_BASE64 } from "../constants/newsletter.constants";
import { NewsletterCampaignService } from "../services/newsletter-campaign.service";
import { NewsletterSubscriberService } from "../services/newsletter-subscriber.service";
import { NewsletterTrackingService } from "../services/newsletter-tracking.service";
import { isAllowedRedirect, readRawBody, recipientIdParam } from "../utils/newsletter-public.helpers";

@Public()
@Controller("newsletter")
export class NewsletterPublicController {
  constructor(
    private readonly subscriberService: NewsletterSubscriberService,
    private readonly trackingService: NewsletterTrackingService,
    private readonly campaignService: NewsletterCampaignService,
  ) {}

  @Post("subscribe")
  @RateLimit([NEWSLETTER_RATE_LIMIT_POLICIES.subscribe, NEWSLETTER_RATE_LIMIT_POLICIES.subscribeAccount])
  @HttpCode(200)
  async subscribe(
    @Body({ schema: SubscribeNewsletterSchema }) dto: SubscribeNewsletterDto,
    @Req() request: Request,
  ): Promise<SubscribeNewsletterResponse> {
    return await this.subscriberService.subscribe(dto, {
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    });
  }

  @Get("confirm")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.confirm)
  async confirm(@Query("token") token: string): Promise<SubscribeNewsletterResponse> {
    if (!token) throw new NotFoundException("Missing confirmation token");
    return await this.subscriberService.confirm(token);
  }

  @Get("unsubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async unsubscribe(@Query("token") token: string): Promise<UnsubscribeNewsletterResponse> {
    if (!token) throw new NotFoundException("Missing unsubscribe token");
    return await this.subscriberService.unsubscribe(token);
  }

  @Post("unsubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async oneClickUnsubscribe(@Body("List-Unsubscribe") payload: string, @Query("token") token: string) {
    if (!token && payload !== "List-Unsubscribe=One-Click") {
      throw new NotFoundException("Missing unsubscribe token");
    }
    await this.trackingService.oneClickUnsubscribe(token);
    return { message: "Unsubscribed" };
  }

  @Get("preferences")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async preferences(@Query("token") token: string): Promise<ManageSubscriptionResponse> {
    if (!token) throw new NotFoundException("Missing preferences token");
    return await this.trackingService.getPreferences(token);
  }

  @Post("preferences")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async updatePreferences(
    @Query("token") token: string,
    @Body({ schema: UpdateNewsletterPreferencesSchema }) dto: UpdateNewsletterPreferencesDto,
  ): Promise<ManageSubscriptionResponse> {
    if (!token) throw new NotFoundException("Missing preferences token");
    return await this.trackingService.updatePreferences(token, dto);
  }

  @Post("resubscribe")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async resubscribe(@Query("token") token: string): Promise<SubscribeNewsletterResponse> {
    if (!token) throw new NotFoundException("Missing manage token");
    return await this.subscriberService.resubscribe(token);
  }

  @Get("campaigns/:uuid")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async getPublicCampaign(@Param("uuid") uuid: string): Promise<PublicNewsletterCampaignResponse> {
    const campaign = await this.campaignService.findByUuid(uuid);
    const preview = await this.campaignService.preview(campaign.id);
    return {
      id: String(campaign.id),
      uuid: campaign.uuid,
      subject: campaign.subject,
      previewText: campaign.previewText,
      fromName: campaign.fromName,
      sentAt: campaign.sentAt ? campaign.sentAt.toISOString() : null,
      html: preview.html,
    };
  }

  @Get("campaigns")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async getPublicCampaigns() {
    const result = await this.campaignService.findAll({
      page: 1,
      limit: 10,
      status: NewsletterStatus.SENT,
      sortBy: "sent_at",
      sortOrder: "DESC",
    });
    return result.items.map((c) => ({
      id: c.id,
      subject: c.subject,
      previewText: c.previewText,
      sentAt: c.sentAt,
    }));
  }

  @Get("track/open/:recipientId")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async trackOpen(@Param("recipientId") recipientId: string, @Req() request: Request, @Res() response: Response) {
    await this.safely(() =>
      this.trackingService.recordOpen(recipientIdParam(recipientId), {
        ipAddress: request.ip,
        userAgent: request.get("user-agent"),
      }),
    );
    response.setHeader("Content-Type", "image/gif");
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.setHeader("Content-Length", String(Buffer.from(NEWSLETTER_OPEN_PIXEL_BASE64, "base64").length));
    response.end(Buffer.from(NEWSLETTER_OPEN_PIXEL_BASE64, "base64"));
  }

  @Get("track/click/:recipientId")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  async trackClick(
    @Param("recipientId") recipientId: string,
    @Query("url") url: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const target = isAllowedRedirect(url) ? url : "/";
    await this.safely(() =>
      this.trackingService.recordClick(recipientIdParam(recipientId), target, {
        ipAddress: request.ip,
        userAgent: request.get("user-agent"),
      }),
    );
    response.setHeader("Cache-Control", "no-store");
    response.redirect(302, target);
  }

  @Post("webhooks/deliverability")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.selfService)
  @HttpCode(200)
  async deliverabilityWebhook(@Req() request: Request) {
    const rawBody = readRawBody(request);
    const signature =
      request.get("svix-signature") ?? request.get("x-resend-signature") ?? request.get("x-signature") ?? undefined;
    return await this.trackingService.handleWebhook(rawBody, signature);
  }

  private async safely(work: () => Promise<void>): Promise<void> {
    try {
      await work();
    } catch {}
  }
}
