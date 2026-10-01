import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AdministrativeDivision } from "../entities/administrative-divisions.entity";
import type { City } from "../entities/cities.entity";
import { AddressesRepository } from "../repositories/addresses.repository";
import { AdministrativeDivisionsRepository } from "../repositories/administrative-divisions.repository";
import { CitiesRepository } from "../repositories/cities.repository";
import { CountriesRepository } from "../repositories/countries.repository";
import {
  type AddressResponse,
  type CreateAddressDto,
  formatAddressString,
  toAddressResponse,
  type UpdateAddressDto,
} from "@orgatick/contracts";
import type { Address } from "../entities/addresses.entity";

@Injectable()
export class AddressesService {
  constructor(
    private readonly addressesRepository: AddressesRepository,
    private readonly countriesRepository: CountriesRepository,
    private readonly divisionsRepository: AdministrativeDivisionsRepository,
    private readonly citiesRepository: CitiesRepository,
  ) {}

  async create(dto: CreateAddressDto): Promise<AddressResponse> {
    const address = await this.CreateAddress(dto);
    return toAddressResponse(address, address.country, address.division, address.city);
  }

  async findByUuid(uuid: string): Promise<AddressResponse> {
    const address = await this.addressesRepository.findByUuid(uuid);
    if (!address) throw new NotFoundException(`Address with UUID '${uuid}' not found`);
    return toAddressResponse(address, address.country, address.division, address.city);
  }

  async update(uuid: string, dto: UpdateAddressDto): Promise<AddressResponse> {
    const address = await this.addressesRepository.findByUuid(uuid);
    if (!address) throw new NotFoundException(`Address with UUID '${uuid}' not found`);

    let country = address.country;
    if (dto.countryId && dto.countryId !== address.country.id) {
      const found = await this.countriesRepository.findById(dto.countryId);
      if (!found) throw new NotFoundException(`Country with UUID '${dto.countryId}' not found`);
      country = found;
      address.countryId = found.id;
    }

    let division = address.division ?? null;
    if (dto.divisionId !== undefined) {
      if (dto.divisionId === null) {
        division = null;
        address.divisionId = null;
      } else {
        const found = await this.divisionsRepository.findById(dto.divisionId);
        if (!found) throw new NotFoundException(`Administrative division with UUID '${dto.divisionId}' not found`);
        division = found;
        address.divisionId = found.id;
      }
    }

    let city = address.city ?? null;
    if (dto.cityId !== undefined) {
      if (dto.cityId === null) {
        city = null;
        address.cityId = null;
      } else {
        const found = await this.citiesRepository.findById(dto.cityId);
        if (!found) throw new NotFoundException(`City with ID '${dto.cityId}' not found`);
        city = found;
        address.cityId = found.id;
      }
    }

    if (dto.addressLine1 !== undefined) address.addressLine1 = dto.addressLine1;
    if (dto.addressLine2 !== undefined) address.addressLine2 = dto.addressLine2;
    if (dto.landmark !== undefined) address.landmark = dto.landmark;
    if (dto.postalCode !== undefined) address.postalCode = dto.postalCode;
    if (dto.latitude !== undefined) address.latitude = dto.latitude;
    if (dto.longitude !== undefined) address.longitude = dto.longitude;
    if (dto.isActive !== undefined) address.isActive = dto.isActive;

    address.formattedAddress =
      dto.formattedAddress ||
      formatAddressString(
        {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? undefined,
          landmark: address.landmark ?? undefined,
          postalCode: address.postalCode ?? undefined,
        },
        country.name,
        division?.name,
        city?.name,
      );

    const updated = await this.addressesRepository.save(address);
    return toAddressResponse(updated, country, division, city);
  }

  async delete(uuid: string): Promise<void> {
    const success = await this.addressesRepository.softDelete(uuid);
    if (!success) throw new NotFoundException(`Address with UUID '${uuid}' not found`);
  }

  async CreateAddress(dto: CreateAddressDto): Promise<Address> {
    const country = await this.countriesRepository.findById(dto.countryId);
    if (!country) throw new NotFoundException(`Country with UUID '${dto.countryId}' not found`);
    let division: AdministrativeDivision | null = null;
    if (dto.divisionId) {
      division = await this.divisionsRepository.findById(dto.divisionId);
      if (!division) throw new NotFoundException(`Administrative division with UUID '${dto.divisionId}' not found`);
      if (Number(division.countryId) !== Number(country.id)) {
        throw new BadRequestException("Administrative division does not belong to the specified country");
      }
    }
    let city: City | null = null;
    if (dto.cityId) {
      city = await this.citiesRepository.findById(dto.cityId);
      if (!city) throw new NotFoundException(`City with UUID '${dto.cityId}' not found`);
      if (Number(city.countryId) !== Number(country.id)) {
        throw new BadRequestException("City does not belong to the specified country");
      }
    }
    const formattedAddress = dto.formattedAddress || formatAddressString(dto, country.name, division?.name, city?.name);
    const addressEntity = this.addressesRepository.create({
      countryId: country.id,
      divisionId: division?.id ?? null,
      cityId: city?.id ?? null,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2 ?? null,
      landmark: dto.landmark ?? null,
      postalCode: dto.postalCode ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      formattedAddress,
      isActive: true,
    });

    const saved = await this.addressesRepository.save(addressEntity);
    return saved;
  }
}
