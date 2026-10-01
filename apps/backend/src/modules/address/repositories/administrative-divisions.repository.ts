import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository, SelectQueryBuilder } from "typeorm";
import { AdministrativeDivision } from "../entities/administrative-divisions.entity";
import type { AdministrativeDivisionFindOptions } from "@orgatick/contracts";

@Injectable()
export class AdministrativeDivisionsRepository {
  constructor(
    @InjectRepository(AdministrativeDivision)
    private readonly repo: Repository<AdministrativeDivision>,
  ) {}

  async findById(id: bigint): Promise<AdministrativeDivision | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        country: true,
        parent: true,
      },
    });
  }

  async findPaginated(options: AdministrativeDivisionFindOptions): Promise<[AdministrativeDivision[], number]> {
    const qb: SelectQueryBuilder<AdministrativeDivision> = this.repo
      .createQueryBuilder("division")
      .leftJoinAndSelect("division.country", "country")
      .leftJoinAndSelect("division.parent", "parent");

    if (options.countryId) {
      qb.andWhere("division.country_id = :countryId", { countryId: options.countryId });
    }
    if (options.parentId !== undefined) {
      qb.andWhere("division.parent_id = :parentId", { parentId: options.parentId });
    }
    if (options.level) {
      qb.andWhere("division.level = :level", { level: options.level });
    }
    if (options.isActive !== undefined) {
      qb.andWhere("division.is_active = :isActive", { isActive: options.isActive });
    }
    if (options.search) {
      qb.andWhere("(division.name ILIKE :search OR division.name_ascii ILIKE :search OR division.code ILIKE :search)", {
        search: `%${options.search}%`,
      });
    }

    qb.orderBy("division.name", "ASC").skip(options.skip).take(options.take);

    return await qb.getManyAndCount();
  }
}
