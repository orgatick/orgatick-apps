import { Injectable, NotFoundException } from "@nestjs/common";
import type { City } from "../entities/cities.entity";
import { AdministrativeDivisionsRepository } from "../repositories/administrative-divisions.repository";
import { CitiesRepository } from "../repositories/cities.repository";
import { CountriesRepository } from "../repositories/countries.repository";
import type { CityDetailResponse, PaginatedResult, QueryCityDto } from "@orgatick/contracts";

@Injectable()
export class CitiesService {
  constructor(
    private readonly citiesRepository: CitiesRepository,
    private readonly countriesRepository: CountriesRepository,
    private readonly divisionsRepository: AdministrativeDivisionsRepository,
  ) {}

  async findAll(query: QueryCityDto): Promise<PaginatedResult<CityDetailResponse>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    let countryId: bigint | undefined;
    if (query.countryId) {
      const country = await this.countriesRepository.findById(query.countryId);
      if (country) countryId = country.id;
    }

    let admin1Id: bigint | undefined;
    if (query.admin1Id) {
      const admin1 = await this.divisionsRepository.findById(query.admin1Id);
      if (admin1) admin1Id = admin1.id;
    }

    let admin2Id: bigint | undefined;
    if (query.admin2Id) {
      const admin2 = await this.divisionsRepository.findById(query.admin2Id);
      if (admin2) admin2Id = admin2.id;
    }

    const [items, total] = await this.citiesRepository.findPaginated({
      skip,
      take: limit,
      countryId,
      admin1Id,
      admin2Id,
      search: query.search,
    });

    return {
      items: items.map((city) => this.mapToResponse(city)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: bigint): Promise<CityDetailResponse> {
    const city = await this.citiesRepository.findById(id);
    if (!city) throw new NotFoundException(`City not found`);
    return this.mapToResponse(city);
  }

  private mapToResponse(city: City): CityDetailResponse {
    return {
      id: city.id,
      name: city.name,
      nameAscii: city.nameAscii,
      slug: city.slug ?? null,
      latitude: Number(city.latitude),
      longitude: Number(city.longitude),
      timezone: city.timezone ?? null,
      isActive: city.isActive,
      country: {
        id: city.country.id,
        code: city.country.code,
        name: city.country.name,
      },
      admin1: city.admin1
        ? {
            id: city.admin1.id,
            code: city.admin1.code,
            name: city.admin1.name,
          }
        : null,
      admin2: city.admin2
        ? {
            id: city.admin2.id,
            code: city.admin2.code,
            name: city.admin2.name,
          }
        : null,
    };
  }
}
