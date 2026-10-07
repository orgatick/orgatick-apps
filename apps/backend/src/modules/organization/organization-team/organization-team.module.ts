import { Module } from "@nestjs/common";
import { OrganizationContextModule } from "../context/organization-context.module";
import { OrganizationInvitationModule } from "../organization-invitation/organization-invitation.module";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import { TeamInvitationController } from "./controllers/team-invitation.controller";
import { TeamMemberController } from "./controllers/team-member.controller";

@Module({
  imports: [OrganizationContextModule, OrganizationMemberModule, OrganizationInvitationModule],
  controllers: [TeamMemberController, TeamInvitationController],
})
export class OrganizationTeamModule {}
