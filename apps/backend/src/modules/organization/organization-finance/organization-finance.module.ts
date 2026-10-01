import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationCommissionSetting, OrganizationPaymentAccount } from "./entities";
import { OrganizationFinanceRepository } from "./repositories/finance.repository";
import { OrganizationFinanceService } from "./services/finance.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationCommissionSetting, OrganizationPaymentAccount])],
  providers: [OrganizationFinanceService, OrganizationFinanceRepository],
  exports: [OrganizationFinanceService, TypeOrmModule],
})
export class OrganizationFinanceModule {}
