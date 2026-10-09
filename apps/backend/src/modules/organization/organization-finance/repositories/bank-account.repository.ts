import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { OrganizationBankAccount } from "../entities/organization-bank-account.entity";

@Injectable()
export class OrganizationBankAccountRepository extends Repository<OrganizationBankAccount> {
  constructor(dataSource: DataSource) {
    super(OrganizationBankAccount, dataSource.createEntityManager());
  }

  async findByOrganizationId(organizationId: bigint): Promise<OrganizationBankAccount | null> {
    return this.findOne({ where: { organizationId } });
  }
}
