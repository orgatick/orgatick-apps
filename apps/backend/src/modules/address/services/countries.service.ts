import { Injectable, NotFoundException } from "@nestjs/common";
import type { Country } from "../entities/countries.entity";
import { CountriesRepository } from "../repositories/countries.repository";
import type { CountryDetailResponse, PaginatedResult, QueryCountryDto } from "@orgatick/contracts";

@Injectable()
export class CountriesService {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async findAll(query: QueryCountryDto): Promise<PaginatedResult<CountryDetailResponse>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(250, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [countries, total] = await this.countriesRepository.findPaginated({
      skip,
      take: limit,
      search: query.search,
      continentCode: query.continentCode,
      isActive: query.isActive,
    });

    return {
      items: countries.map((c) => this.mapToResponse(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCodeOrId(identifier: string | bigint): Promise<CountryDetailResponse> {
    let country: Country | null = null;
    if (typeof identifier === "string" && (identifier.length === 2 || identifier.length === 3)) {
      country = await this.countriesRepository.findByCode(identifier);
    }
    if (typeof identifier === "bigint") {
      country = await this.countriesRepository.findById(identifier);
    }
    if (!country) {
      throw new NotFoundException(`Country '${identifier}' not found`);
    }
    return this.mapToResponse(country);
  }

  private mapToResponse(c: Country): CountryDetailResponse {
    return {
      id: c.id,
      code: c.code,
      code3: c.code3,
      numericCode: c.numericCode,
      name: c.name,
      capital: c.capital ?? null,
      currencyCode: c.currencyCode ?? null,
      currencyName: c.currencyName ?? null,
      phoneCode: c.phoneCode ?? null,
      postalCodeRegex: c.postalCodeRegex ?? null,
      tld: c.tld ?? null,
      isActive: c.isActive,
    };
  }
}
