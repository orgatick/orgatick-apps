import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAdminGuard } from "@/common/authorization";
import { Organization } from "../organization/entities/organization.entity";
import { OrganizationDocument } from "../organization-governance/entities/organization-document.entity";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import {
  OrganizationCommissionSetting,
  OrganizationPaymentAccount,
  OrganizationPricingSetting,
  OrganizationBankAccount,
} from "./entities";
import { AdminPricingController } from "./controllers/admin-pricing.controller";
import { OrganizationPricingController } from "./controllers/organization-pricing.controller";
import { AdminBankAccountController } from "./controllers/admin-bank-account.controller";
import { OrganizationBankAccountController } from "./controllers/organization-bank-account.controller";
import { AdminCommissionController } from "./controllers/admin-commission.controller";
import { OrganizationCommissionController } from "./controllers/organization-commission.controller";
import { OrganizationFinanceRepository } from "./repositories/finance.repository";
import { OrganizationPricingRepository } from "./repositories/pricing.repository";
import { OrganizationBankAccountRepository } from "./repositories/bank-account.repository";
import { OrganizationFinanceService } from "./services/finance.service";
import { OrganizationPricingMailerService } from "./services/organization-pricing-mailer.service";
import { OrganizationPricingService } from "./services/pricing.service";
import { OrganizationBankAccountService } from "./services/bank-account.service";

@Module({
  imports: [
    ConfigModule,
    OrganizationMemberModule,
    TypeOrmModule.forFeature([
      Organization,
      OrganizationCommissionSetting,
      OrganizationPaymentAccount,
      OrganizationPricingSetting,
      OrganizationDocument,
      OrganizationBankAccount,
    ]),
  ],
  controllers: [
    AdminPricingController,
    OrganizationPricingController,
    AdminBankAccountController,
    OrganizationBankAccountController,
    AdminCommissionController,
    OrganizationCommissionController,
  ],
  providers: [
    OrganizationFinanceService,
    OrganizationFinanceRepository,
    OrganizationPricingService,
    OrganizationPricingRepository,
    OrganizationPricingMailerService,
    OrganizationBankAccountService,
    OrganizationBankAccountRepository,
    PlatformAdminGuard,
  ],
  exports: [
    OrganizationFinanceService,
    OrganizationPricingService,
    OrganizationPricingRepository,
    OrganizationBankAccountService,
    OrganizationBankAccountRepository,
    TypeOrmModule,
  ],
})
export class OrganizationFinanceModule {}
