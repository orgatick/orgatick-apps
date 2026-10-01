import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository, SelectQueryBuilder } from "typeorm";
import { Address } from "../entities/addresses.entity";
import type { AddressFindOptions } from "@orgatick/contracts";

@Injectable()
export class AddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  create(data: Partial<Address>): Address {
    return this.repo.create(data);
  }

  async save(address: Address): Promise<Address> {
    return await this.repo.save(address);
  }

  async findByUuid(uuid: string): Promise<Address | null> {
    return await this.repo.findOne({
      where: { uuid },
      relations: {
        country: true,
        division: true,
        city: true,
      },
    });
  }

  async findById(id: bigint): Promise<Address | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        country: true,
        division: true,
        city: true,
      },
    });
  }

  async findPaginated(options: AddressFindOptions): Promise<[Address[], number]> {
    const qb: SelectQueryBuilder<Address> = this.repo
      .createQueryBuilder("address")
      .leftJoinAndSelect("address.country", "country")
      .leftJoinAndSelect("address.division", "division")
      .leftJoinAndSelect("address.city", "city");

    if (options.countryId) {
      qb.andWhere("address.country_id = :countryId", { countryId: options.countryId });
    }
    if (options.divisionId) {
      qb.andWhere("address.division_id = :divisionId", { divisionId: options.divisionId });
    }
    if (options.cityId) {
      qb.andWhere("address.city_id = :cityId", { cityId: options.cityId });
    }
    if (options.postalCode) {
      qb.andWhere("address.postal_code ILIKE :postalCode", { postalCode: `%${options.postalCode}%` });
    }
    if (options.isActive !== undefined) {
      qb.andWhere("address.is_active = :isActive", { isActive: options.isActive });
    }
    if (options.search) {
      qb.andWhere(
        "(address.address_line_1 ILIKE :search OR address.address_line_2 ILIKE :search OR address.formatted_address ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    qb.orderBy("address.createdAt", "DESC").skip(options.skip).take(options.take);

    return await qb.getManyAndCount();
  }

  async softDelete(uuid: string): Promise<boolean> {
    const result = await this.repo.update({ uuid }, { isActive: false });
    return (result.affected ?? 0) > 0;
  }
}
