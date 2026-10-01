import { Controller, Get, Param, Query } from "@nestjs/common";
import { Public } from "@/common/decorators/public.decorator";
import { CitiesService } from "../services/cities.service";
import { type CityDetailResponse, type PaginatedResult, type QueryCityDto, QueryCitySchema } from "@orgatick/contracts";

@Controller("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Public()
  @Get()
  async findAll(@Query({ schema: QueryCitySchema }) query: QueryCityDto): Promise<PaginatedResult<CityDetailResponse>> {
    return await this.citiesService.findAll(query);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<CityDetailResponse> {
    return await this.citiesService.findById(BigInt(id));
  }
}
