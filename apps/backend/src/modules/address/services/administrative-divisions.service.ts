import { Injectable, NotFoundException } from "@nestjs/common";
import type { AdministrativeDivision } from "../entities/administrative-divisions.entity";
import { AdministrativeDivisionsRepository } from "../repositories/administrative-divisions.repository";
import { CountriesRepository } from "../repositories/countries.repository";
import type {
  AdministrativeDivisionResponse,
  PaginatedResult,
  QueryAdministrativeDivisionDto,
} from "@orgatick/contracts";

@Injectable()
export class AdministrativeDivisionsService {
  constructor(
    private readonly divisionsRepository: AdministrativeDivisionsRepository,
    private readonly countriesRepository: CountriesRepository,
  ) {}

  async findAll(query: QueryAdministrativeDivisionDto): Promise<PaginatedResult<AdministrativeDivisionResponse>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    let countryId: bigint | undefined;
    if (query.countryId) {
      const country = await this.countriesRepository.findById(query.countryId);
      if (country) countryId = country.id;
    }

    let parentId: bigint | undefined;
    if (query.parentId) {
      const parent = await this.divisionsRepository.findById(query.parentId);
      if (parent) parentId = parent.id;
    }

    const [items, total] = await this.divisionsRepository.findPaginated({
      skip,
      take: limit,
      countryId,
      parentId,
      level: query.level,
      search: query.search,
    });

    return {
      items: items.map((div) => this.mapToResponse(div)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: bigint): Promise<AdministrativeDivisionResponse> {
    const division = await this.divisionsRepository.findById(id);
    if (!division) throw new NotFoundException(`Division not found`);
    return this.mapToResponse(division);
  }

  private mapToResponse(div: AdministrativeDivision): AdministrativeDivisionResponse {
    return {
      id: div.id,
      code: div.code,
      name: div.name,
      nameAscii: div.nameAscii,
      level: div.level,
      isActive: div.isActive,
      country: {
        id: div.country.id,
        code: div.country.code,
        name: div.country.name,
      },
      parent: div.parent
        ? {
            id: div.parent.id,
            code: div.parent.code,
            name: div.parent.name,
            level: div.parent.level,
          }
        : null,
    };
  }
}
