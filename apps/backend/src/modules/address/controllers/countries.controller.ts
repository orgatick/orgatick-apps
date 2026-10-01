import { Controller, Get, Param, Query } from "@nestjs/common";
import { CountriesService } from "../services/countries.service";
import {
  type CountryDetailResponse,
  type PaginatedResult,
  type QueryCountryDto,
  QueryCountrySchema,
} from "@orgatick/contracts";
import { Public } from "@/common/decorators/public.decorator";

@Controller("countries")
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Get()
  async findAll(
    @Query({ schema: QueryCountrySchema }) query: QueryCountryDto,
  ): Promise<PaginatedResult<CountryDetailResponse>> {
    return await this.countriesService.findAll(query);
  }

  @Public()
  @Get(":codeOrId")
  async findOne(@Param("codeOrId") codeOrId: string): Promise<CountryDetailResponse> {
    return await this.countriesService.findByCodeOrId(codeOrId);
  }
}
