import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository, SelectQueryBuilder } from "typeorm";
import { City } from "../entities/cities.entity";
import type { CityFindOptions } from "@orgatick/contracts";

@Injectable()
export class CitiesRepository {
  constructor(
    @InjectRepository(City)
    private readonly repo: Repository<City>,
  ) {}

  async findById(id: bigint): Promise<City | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        country: true,
        admin1: true,
        admin2: true,
      },
    });
  }

  async findPaginated(options: CityFindOptions): Promise<[City[], number]> {
    const qb: SelectQueryBuilder<City> = this.repo
      .createQueryBuilder("city")
      .leftJoinAndSelect("city.country", "country")
      .leftJoinAndSelect("city.admin1", "admin1")
      .leftJoinAndSelect("city.admin2", "admin2");

    if (options.countryId) {
      qb.andWhere("city.country_id = :countryId", { countryId: options.countryId });
    }
    if (options.admin1Id) {
      qb.andWhere("city.admin1_id = :admin1Id", { admin1Id: options.admin1Id });
    }
    if (options.admin2Id) {
      qb.andWhere("city.admin2_id = :admin2Id", { admin2Id: options.admin2Id });
    }
    if (options.isActive !== undefined) {
      qb.andWhere("city.is_active = :isActive", { isActive: options.isActive });
    }
    if (options.search) {
      qb.andWhere("(city.name ILIKE :search OR city.name_ascii ILIKE :search OR city.slug ILIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    qb.orderBy("city.name", "ASC").skip(options.skip).take(options.take);

    return await qb.getManyAndCount();
  }
}
