import { Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Public } from "../../../../common/decorators/public.decorator";
import { FormDataJsonInterceptor } from "../../../../common/interceptors/form-data-json.interceptor";
import type { AuthRequest } from "../../../../common/types/auth-request.types";
import { SkipRateLimit } from "../../../../infrastructure/rate-limit";
import {
  type CreateOrganizationDto,
  CreateOrganizationSchema,
  type OrganizationQueryDto,
  OrganizationQuerySchema,
  type UpdateOrganizationDto,
  UpdateOrganizationSchema,
} from "../dto";
import { OrganizationService } from "../services/organization.service";

@Controller("organizations")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * POST /organizations
   * Create a new organization with multipart/form-data (data + logo + documents).
   * Authenticated user automatically becomes the OWNER.
   */
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 * 10 },
    }),
    FormDataJsonInterceptor,
  )
  async create(
    @Req() req: AuthRequest,
    @Body({ schema: CreateOrganizationSchema }) dto: CreateOrganizationDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = BigInt(req.user.id);
    return await this.organizationService.create(userId, dto, files);
  }

  /**
   * GET /organizations
   * Public endpoint to list and search organizations with filters & pagination.
   */
  @Public()
  @Get()
  @SkipRateLimit()
  async findAll(@Query({ schema: OrganizationQuerySchema }) query: OrganizationQueryDto) {
    return await this.organizationService.findAll(query);
  }

  /**
   * GET /organizations/my
   * Get organizations where the authenticated user is a member.
   */
  @Get("my")
  async findMyOrganizations(@Req() req: AuthRequest) {
    const userId = BigInt(req.user.id);
    return await this.organizationService.findMyOrganizations(userId);
  }

  /**
   * GET /organizations/:idOrSlug
   * Public endpoint to get full details of an organization by ID or slug.
   */
  @Public()
  @Get(":idOrSlug")
  async findOne(@Param("idOrSlug") idOrSlug: string) {
    return await this.organizationService.findByIdOrSlug(idOrSlug);
  }

  /**
   * PATCH /organizations/:id
   * Update organization details (requires OWNER or ADMIN role).
   */
  @Patch(":id")
  async update(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: UpdateOrganizationSchema }) dto: UpdateOrganizationDto,
  ) {
    const userId = BigInt(req.user.id);
    return await this.organizationService.update(userId, BigInt(id), dto);
  }
}
