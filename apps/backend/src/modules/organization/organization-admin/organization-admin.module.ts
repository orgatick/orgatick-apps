import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../users/entities/user.entity";
import { Organization } from "../organization/entities/organization.entity";
import { OrganizationRepository } from "../organization/repositories/organization.repository";
import { OrganizationGovernanceModule } from "../organization-governance/organization-governance.module";
import { OrganizationVerification } from "../organization-governance/entities/organization-verification.entity";
import { OrganizationDocument } from "../organization-governance/entities/organization-document.entity";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import {
  OrganizationAdminNote,
  OrganizationAdminState,
  OrganizationOwnershipHistory,
  OrganizationStatusHistory,
  OrganizationVerificationLog,
} from "./entities";
import { AdminAccessController } from "./controllers/admin-access.controller";
import { AdminClosureController } from "./controllers/admin-closure.controller";
import { AdminDocumentController } from "./controllers/admin-document.controller";
import { AdminMemberController } from "./controllers/admin-member.controller";
import { AdminOrganizationController } from "./controllers/admin-organization.controller";
import { AdminVerificationController } from "./controllers/admin-verification.controller";
import { AdminStateRepository } from "./repositories/admin-state.repository";
import { AdminTrackingRepository } from "./repositories/admin-tracking.repository";
import { AdminAccessService } from "./services/admin-access.service";
import { AdminClosureService } from "./services/admin-closure.service";
import { AdminDocumentService } from "./services/admin-document.service";
import { AdminMemberService } from "./services/admin-member.service";
import { AdminNoteService } from "./services/admin-note.service";
import { AdminOrganizationService } from "./services/admin-organization.service";
import { AdminOwnershipService } from "./services/admin-ownership.service";
import { AdminTrackingService } from "./services/admin-tracking.service";
import { AdminVerificationService } from "./services/admin-verification.service";
import { StorageModule } from "@/infrastructure/storage/storage.module";
import { PlatformAdminGuard } from "@/common/authorization";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      User,
      OrganizationAdminState,
      OrganizationStatusHistory,
      OrganizationVerificationLog,
      OrganizationOwnershipHistory,
      OrganizationAdminNote,
      OrganizationVerification,
      OrganizationDocument,
    ]),
    OrganizationMemberModule,
    OrganizationGovernanceModule,
    StorageModule,
  ],
  controllers: [
    AdminOrganizationController,
    AdminAccessController,
    AdminClosureController,
    AdminVerificationController,
    AdminMemberController,
    AdminDocumentController,
  ],
  providers: [
    OrganizationRepository,
    AdminStateRepository,
    AdminTrackingRepository,
    AdminOrganizationService,
    AdminTrackingService,
    AdminAccessService,
    AdminClosureService,
    AdminVerificationService,
    AdminMemberService,
    AdminOwnershipService,
    AdminDocumentService,
    AdminNoteService,
    PlatformAdminGuard,
  ],
  exports: [OrganizationRepository, AdminStateRepository, AdminTrackingRepository, AdminOrganizationService],
})
export class OrganizationAdminModule {}
