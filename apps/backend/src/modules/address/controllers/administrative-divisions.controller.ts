import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  type AdministrativeDivisionResponse,
  type PaginatedResult,
  type QueryAdministrativeDivisionDto,
  QueryAdministrativeDivisionSchema,
} from "@orgatick/contracts";
import { Public } from "@/common/decorators/public.decorator";
import { AdministrativeDivisionsService } from "../services/administrative-divisions.service";

@Controller("administrative-divisions")
export class AdministrativeDivisionsController {
  constructor(private readonly divisionsService: AdministrativeDivisionsService) {}

  @Public()
  @Get()
  async findAll(
    @Query({ schema: QueryAdministrativeDivisionSchema })
    query: QueryAdministrativeDivisionDto,
  ): Promise<PaginatedResult<AdministrativeDivisionResponse>> {
    return await this.divisionsService.findAll(query);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<AdministrativeDivisionResponse> {
    return await this.divisionsService.findById(BigInt(id));
  }
}
