import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StorageModule } from "../../../infrastructure/storage/storage.module";
import { AddressModule } from "../../address/address.module";
import { OrganizationCategoryModule } from "../organization-category/organization-category.module";
import { OrganizationFinanceModule } from "../organization-finance/organization-finance.module";
import { OrganizationGovernanceModule } from "../organization-governance/organization-governance.module";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import { OrganizationAdminModule } from "../organization-admin/organization-admin.module";
import { OrganizationController, OrganizationVerificationController } from "./controllers";
import { Organization, OrganizationSocialLink, OrganizationStats, OrganizationSupportContact } from "./entities";
import { OrganizationRepository } from "./repositories/organization.repository";
import { OrganizationService } from "./services";

@Module({
  imports: [
    AddressModule,
    StorageModule,
    OrganizationCategoryModule,
    OrganizationMemberModule,
    OrganizationGovernanceModule,
    OrganizationFinanceModule,
    OrganizationAdminModule,
    TypeOrmModule.forFeature([Organization, OrganizationStats, OrganizationSocialLink, OrganizationSupportContact]),
  ],
  controllers: [OrganizationController, OrganizationVerificationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository, TypeOrmModule],
})
export class OrganizationRootModule {}
