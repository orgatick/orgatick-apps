import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import {
  CreateNewsletterListSchema,
  type CreateNewsletterListDto,
  type NewsletterListResponse,
  type NewsletterSubscriberQueryDto,
  NewsletterSubscriberQuerySchema,
  type NewsletterSubscriberResponse,
  type NewsletterSubscriberStats,
  type UpdateNewsletterListDto,
  UpdateNewsletterListSchema,
  UpdateSubscriberStatusSchema,
  type UpdateSubscriberStatusDto,
} from "@orgatick/contracts";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { NewsletterSubscriberService } from "../services/newsletter-subscriber.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/newsletter")
export class AdminNewsletterSubscriberController {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  // ---------------------------------------------------------------- subscribers

  @Get("subscribers")
  async findSubscribers(@Query({ schema: NewsletterSubscriberQuerySchema }) query: NewsletterSubscriberQueryDto) {
    return await this.subscriberService.findAll(query);
  }

  @Get("subscribers/stats")
  async subscriberStats(@Query("listId") listId?: string): Promise<NewsletterSubscriberStats> {
    return await this.subscriberService.stats(listId);
  }

  @Get("subscribers/:id")
  async findSubscriber(@Param("id") id: string): Promise<NewsletterSubscriberResponse> {
    return await this.subscriberService.findOne(bigintParam(id));
  }

  /** Admin-side resubscribe, used after a support request. */
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

  // ---------------------------------------------------------------------- lists

  @Get("lists")
  async findLists(): Promise<NewsletterListResponse[]> {
    return await this.subscriberService.findLists();
  }

  @Post("lists")
  async createList(
    @Body({ schema: CreateNewsletterListSchema }) dto: CreateNewsletterListDto,
  ): Promise<NewsletterListResponse> {
    return await this.subscriberService.createList(dto);
  }

  @Patch("lists/:id")
  async updateList(
    @Param("id") id: string,
    @Body({ schema: UpdateNewsletterListSchema }) dto: UpdateNewsletterListDto,
  ): Promise<NewsletterListResponse> {
    return await this.subscriberService.updateList(bigintParam(id), dto);
  }
}

function bigintParam(id: string): bigint {
  const value = BigInt(id);
  if (value <= 0n) {
    throw new BadRequestException("Invalid id");
  }
  return value;
}
