import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  CreateNewsletterSchema,
  DuplicateCampaignSchema,
  NewsletterActionSchema,
  SendTestEmailSchema,
  type CreateNewsletterDto,
  type DuplicateCampaignDto,
  type NewsletterActionDto,
  type NewsletterQueryDto,
  NewsletterQuerySchema,
  type NewsletterRecipientQueryDto,
  NewsletterRecipientQuerySchema,
  type NewsletterResponse,
  type SendTestEmailDto,
  type UpdateNewsletterDto,
  UpdateNewsletterSchema,
} from "@orgatick/contracts";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { RateLimit } from "../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { NEWSLETTER_RATE_LIMIT_POLICIES } from "../../../infrastructure/rate-limit/constants/policies/newsletter.policy";
import { NewsletterCampaignService } from "../services/newsletter-campaign.service";
import type { NewsletterActor } from "../types/newsletter.types";

@UseGuards(PlatformAdminGuard)
@Controller("admin/newsletters")
export class AdminNewsletterController {
  constructor(private readonly campaignService: NewsletterCampaignService) {}

  @Get()
  async findAll(@Query({ schema: NewsletterQuerySchema }) query: NewsletterQueryDto) {
    return await this.campaignService.findAll(query);
  }

  @Post()
  async create(
    @Body({ schema: CreateNewsletterSchema }) dto: CreateNewsletterDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterResponse> {
    return await this.campaignService.create(dto, toActor(request));
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<NewsletterResponse> {
    return await this.campaignService.findOne(bigintParam(id));
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body({ schema: UpdateNewsletterSchema }) dto: UpdateNewsletterDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterResponse> {
    return await this.campaignService.update(bigintParam(id), dto, toActor(request));
  }

  @Post(":id/actions")
  @RateLimit(NEWSLETTER_RATE_LIMIT_POLICIES.dispatch)
  async performAction(
    @Param("id") id: string,
    @Body({ schema: NewsletterActionSchema }) dto: NewsletterActionDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterResponse> {
    return await this.campaignService.performAction(
      bigintParam(id),
      dto.action,
      { scheduledAt: dto.scheduledAt, reason: dto.reason },
      toActor(request),
    );
  }

  @Post(":id/test-email")
  async sendTestEmail(
    @Param("id") id: string,
    @Body({ schema: SendTestEmailSchema }) dto: SendTestEmailDto,
    @Req() request: AuthRequest,
  ): Promise<{ sent: boolean; email: string }> {
    return await this.campaignService.sendTestEmail(bigintParam(id), dto.email, toActor(request));
  }

  @Post(":id/duplicate")
  async duplicate(
    @Param("id") id: string,
    @Body({ schema: DuplicateCampaignSchema }) dto: DuplicateCampaignDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterResponse> {
    return await this.campaignService.duplicate(bigintParam(id), dto.name, toActor(request));
  }

  @Get(":id/recipients")
  async findRecipients(
    @Param("id") id: string,
    @Query({ schema: NewsletterRecipientQuerySchema }) query: NewsletterRecipientQueryDto,
  ) {
    return await this.campaignService.findRecipients(bigintParam(id), query);
  }

  @Get(":id/overview")
  async overview(@Param("id") id: string) {
    return await this.campaignService.overview(bigintParam(id));
  }

  @Get(":id/preview")
  async preview(@Param("id") id: string) {
    return await this.campaignService.preview(bigintParam(id));
  }

  @Post(":id/save-as-template")
  async saveAsTemplate(@Param("id") id: string, @Body("name") name: string | undefined, @Req() request: AuthRequest) {
    return await this.campaignService.saveAsTemplate(bigintParam(id), name, toActor(request));
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.campaignService.remove(bigintParam(id));
    return { message: "Newsletter campaign deleted successfully" };
  }
}

function bigintParam(id: string): bigint {
  const value = BigInt(id);
  if (value <= 0n) throw new BadRequestException("Invalid newsletter id");
  return value;
}

function toActor(request: AuthRequest): NewsletterActor {
  return { id: BigInt(request.user.id), name: request.user.name };
}
