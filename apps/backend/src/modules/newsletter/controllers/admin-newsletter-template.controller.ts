import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import {
  CreateNewsletterTemplateSchema,
  type CreateNewsletterTemplateDto,
  type NewsletterTemplateQueryDto,
  NewsletterTemplateQuerySchema,
  type NewsletterTemplateResponse,
  type UpdateNewsletterTemplateDto,
  UpdateNewsletterTemplateSchema,
} from "@orgatick/contracts";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { NewsletterTemplateService } from "../services/newsletter-template.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/newsletter/templates")
export class AdminNewsletterTemplateController {
  constructor(private readonly templateService: NewsletterTemplateService) {}

  @Get()
  async findAll(@Query({ schema: NewsletterTemplateQuerySchema }) query: NewsletterTemplateQueryDto) {
    return await this.templateService.findAll(query);
  }

  /** Published templates only, for the campaign editor's template picker. */
  @Get("active")
  async findActive(): Promise<NewsletterTemplateResponse[]> {
    return await this.templateService.findActive();
  }

  @Post()
  async create(
    @Body({ schema: CreateNewsletterTemplateSchema }) dto: CreateNewsletterTemplateDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterTemplateResponse> {
    return await this.templateService.create(dto, actorId(request));
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<NewsletterTemplateResponse> {
    return await this.templateService.findOne(bigintParam(id));
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body({ schema: UpdateNewsletterTemplateSchema }) dto: UpdateNewsletterTemplateDto,
    @Req() request: AuthRequest,
  ): Promise<NewsletterTemplateResponse> {
    return await this.templateService.update(bigintParam(id), dto, actorId(request));
  }

  @Post(":id/publish")
  async publish(@Param("id") id: string, @Req() request: AuthRequest): Promise<NewsletterTemplateResponse> {
    return await this.templateService.publish(bigintParam(id), actorId(request));
  }

  @Post(":id/archive")
  async archive(@Param("id") id: string, @Req() request: AuthRequest): Promise<NewsletterTemplateResponse> {
    return await this.templateService.archive(bigintParam(id), actorId(request));
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.templateService.remove(bigintParam(id));
    return { message: "Newsletter template deleted successfully" };
  }
}

function bigintParam(id: string): bigint {
  const value = BigInt(id);
  if (value <= 0n) {
    throw new BadRequestException("Invalid template id");
  }
  return value;
}

function actorId(request: AuthRequest): bigint | null {
  return request.user?.id ? BigInt(request.user.id) : null;
}
