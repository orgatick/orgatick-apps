import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import {
  BulkSubscriberActionSchema,
  type BulkSubscriberActionDto,
  type NewsletterSubscriberQueryDto,
  NewsletterSubscriberQuerySchema,
  type NewsletterSubscriberResponse,
  NewsletterSubscriberSource,
  type NewsletterSubscriberStats,
  type SubscribeNewsletterDto,
  SubscribeNewsletterSchema,
  type SubscribeNewsletterResponse,
  UpdateSubscriberStatusSchema,
  type UpdateSubscriberStatusDto,
} from "@orgatick/contracts";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { NewsletterSubscriberService } from "../services/newsletter-subscriber.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/newsletter")
export class AdminNewsletterSubscriberController {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Get("subscribers")
  async findSubscribers(@Query({ schema: NewsletterSubscriberQuerySchema }) query: NewsletterSubscriberQueryDto) {
    return await this.subscriberService.findAll(query);
  }

  @Get("subscribers/stats")
  async subscriberStats(@Query("listId") listId?: string): Promise<NewsletterSubscriberStats> {
    return await this.subscriberService.stats(listId);
  }

  @Get("subscribers/export")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="subscribers.csv"')
  async exportSubscribers(@Query("listId") listId?: string): Promise<string> {
    return await this.subscriberService.exportCsv(listId);
  }

  @Post("subscribers/bulk")
  async bulkAction(@Body({ schema: BulkSubscriberActionSchema }) dto: BulkSubscriberActionDto) {
    return await this.subscriberService.bulkAction(dto);
  }

  @Get("subscribers/:id")
  async findSubscriber(@Param("id") id: string): Promise<NewsletterSubscriberResponse> {
    return await this.subscriberService.findOne(bigintParam(id));
  }

  @Post("subscribers")
  async addSubscriber(
    @Body({ schema: SubscribeNewsletterSchema }) dto: SubscribeNewsletterDto,
    @Req() request: AuthRequest,
  ): Promise<SubscribeNewsletterResponse> {
    return await this.subscriberService.subscribe(
      { ...dto, source: NewsletterSubscriberSource.ADMIN },
      { userId: BigInt(request.user.id) },
    );
  }

  @Patch("subscribers/:id/status")
  async updateSubscriberStatus(
    @Param("id") id: string,
    @Body({ schema: UpdateSubscriberStatusSchema }) dto: UpdateSubscriberStatusDto,
  ): Promise<NewsletterSubscriberResponse> {
    return await this.subscriberService.updateStatus(bigintParam(id), dto);
  }

  @Delete("subscribers/:id")
  async removeSubscriber(@Param("id") id: string): Promise<{ message: string }> {
    await this.subscriberService.remove(bigintParam(id));
    return { message: "Subscriber unsubscribed successfully" };
  }
}

function bigintParam(id: string): bigint {
  const value = BigInt(id);
  if (value <= 0n) throw new BadRequestException("Invalid id");
  return value;
}
