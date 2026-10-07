import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "../organization/entities/organization.entity";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import { OrganizationInvitationTokenController } from "./controllers/organization-invitation-token.controller";
import { OrganizationInvitation } from "./entities/organization-invitation.entity";
import { OrganizationInvitationRepository } from "./repositories/invitation.repository";
import { OrganizationInvitationService } from "./services/invitation.service";
import { OrganizationInvitationMailerService } from "./services/organization-invitation-mailer.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationInvitation, Organization]), OrganizationMemberModule],
  controllers: [OrganizationInvitationTokenController],
  providers: [OrganizationInvitationService, OrganizationInvitationMailerService, OrganizationInvitationRepository],
  exports: [OrganizationInvitationService, OrganizationInvitationRepository],
})
export class OrganizationInvitationModule {}
