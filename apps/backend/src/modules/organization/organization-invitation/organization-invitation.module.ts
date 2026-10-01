import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationInvitation } from "./entities/organization-invitation.entity";
import { OrganizationInvitationRepository } from "./repositories/invitation.repository";
import { OrganizationInvitationService } from "./services/invitation.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationInvitation])],
  providers: [OrganizationInvitationService, OrganizationInvitationRepository],
  exports: [OrganizationInvitationService, TypeOrmModule],
})
export class OrganizationInvitationModule {}
