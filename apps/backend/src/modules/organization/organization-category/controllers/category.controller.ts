import { Controller, Get, Param, Query } from "@nestjs/common";
import { Public } from "../../../../common/decorators/public.decorator";
import { SkipRateLimit } from "../../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { OrganizationCategoryService } from "../services/category.service";
import { type CategoryQueryDto, CategoryQuerySchema } from "@orgatick/contracts";

@Controller("organization/categories")
export class OrganizationCategoryController {
  constructor(private readonly categoryService: OrganizationCategoryService) {}

  /**
   * GET /organization/categories
   * List categories with pagination, search, and hierarchy filtering via pure TypeORM.
   */
  @Public()
  @SkipRateLimit()
  @Get()
  async findAll(@Query({ schema: CategoryQuerySchema }) query: CategoryQueryDto) {
    return await this.categoryService.findPaginated(query);
  }

  /**
   * GET /organization/categories/:idOrSlug
   * Get category details by numeric ID or unique slug.
   */
  @Public()
  @Get(":idOrSlug")
  async findOne(@Param("idOrSlug") idOrSlug: string) {
    const isNumeric = /^\d+$/.test(idOrSlug);
    if (isNumeric) {
      return await this.categoryService.findById(BigInt(idOrSlug));
    }
    return await this.categoryService.findBySlug(idOrSlug);
  }
}
