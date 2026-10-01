import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StorageModule } from "../../../infrastructure/storage/storage.module";
import { OrganizationDocument, OrganizationRisk, OrganizationVerification, OrganizationWarning } from "./entities";
import { OrganizationGovernanceRepository } from "./repositories/governance.repository";
import { OrganizationGovernanceService } from "./services/governance.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationVerification, OrganizationRisk, OrganizationDocument, OrganizationWarning]),
    StorageModule,
  ],
  providers: [OrganizationGovernanceService, OrganizationGovernanceRepository],
  exports: [OrganizationGovernanceService, TypeOrmModule],
})
export class OrganizationGovernanceModule {}
