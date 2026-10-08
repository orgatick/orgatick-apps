import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  CreateNewsletterListSchema,
  type CreateNewsletterListDto,
  type NewsletterListResponse,
  type UpdateNewsletterListDto,
  UpdateNewsletterListSchema,
} from "@orgatick/contracts";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { NewsletterListService } from "../services/newsletter-list.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/newsletter/lists")
export class AdminNewsletterListController {
  constructor(private readonly listService: NewsletterListService) {}

  @Get()
  async findLists(): Promise<NewsletterListResponse[]> {
    return await this.listService.findLists();
  }

  @Post()
  async createList(
    @Body({ schema: CreateNewsletterListSchema }) dto: CreateNewsletterListDto,
  ): Promise<NewsletterListResponse> {
    return await this.listService.createList(dto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<NewsletterListResponse> {
    return await this.listService.findOne(bigintParam(id));
  }

  @Patch(":id")
  async updateList(
    @Param("id") id: string,
    @Body({ schema: UpdateNewsletterListSchema }) dto: UpdateNewsletterListDto,
  ): Promise<NewsletterListResponse> {
    return await this.listService.updateList(bigintParam(id), dto);
  }

  @Delete(":id")
  async deleteList(@Param("id") id: string): Promise<{ message: string }> {
    await this.listService.deleteList(bigintParam(id));
    return { message: "Mailing list deleted successfully" };
  }
}

function bigintParam(id: string): bigint {
  const value = BigInt(id);
  if (value <= 0n) throw new BadRequestException("Invalid list id");
  return value;
}
