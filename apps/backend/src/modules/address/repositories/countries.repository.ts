import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository, SelectQueryBuilder } from "typeorm";
import { Country } from "../entities/countries.entity";
import type { CountryFindOptions } from "@orgatick/contracts";

@Injectable()
export class CountriesRepository {
  constructor(
    @InjectRepository(Country)
    private readonly repo: Repository<Country>,
  ) {}

  async findByCode(code: string): Promise<Country | null> {
    const upper = code.toUpperCase();
    return await this.repo.findOne({
      where: [{ code: upper }, { code3: upper }],
    });
  }

  async findById(id: bigint): Promise<Country | null> {
    return await this.repo.findOneBy({ id });
  }

  async findPaginated(options: CountryFindOptions): Promise<[Country[], number]> {
    const qb: SelectQueryBuilder<Country> = this.repo.createQueryBuilder("country");

    if (options.continentCode) {
      qb.andWhere("country.continent_code = :continentCode", {
        continentCode: options.continentCode.toUpperCase(),
      });
    }
    if (options.isActive !== undefined) {
      qb.andWhere("country.is_active = :isActive", { isActive: options.isActive });
    }
    if (options.search) {
      qb.andWhere("(country.name ILIKE :search OR country.code ILIKE :search OR country.code3 ILIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    qb.orderBy("country.name", "ASC").skip(options.skip).take(options.take);

    return await qb.getManyAndCount();
  }
}
