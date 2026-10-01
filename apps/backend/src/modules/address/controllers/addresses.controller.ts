import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AddressesService } from "../services/addresses.service";
import {
  type AddressResponse,
  type CreateAddressDto,
  CreateAddressSchema,
  type UpdateAddressDto,
  UpdateAddressSchema,
} from "@orgatick/contracts";

@Controller("addresses")
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body({ schema: CreateAddressSchema }) createAddressDto: CreateAddressDto): Promise<AddressResponse> {
    return await this.addressesService.create(createAddressDto);
  }

  @Patch(":uuid")
  async update(
    @Param("uuid") uuid: string,
    @Body({ schema: UpdateAddressSchema }) updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponse> {
    return await this.addressesService.update(uuid, updateAddressDto);
  }

  @Delete(":uuid")
  async remove(@Param("uuid") uuid: string): Promise<{ message: string }> {
    await this.addressesService.delete(uuid);
    return { message: "Address deleted successfully" };
  }
}
