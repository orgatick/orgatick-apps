import { Module } from "@nestjs/common";
import { OrganizationContextModule } from "../context/organization-context.module";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import { OrganizationSessionController } from "./controllers/organization-session.controller";
import { OrganizationSessionService } from "./services/organization-session.service";

@Module({
  imports: [OrganizationContextModule, OrganizationMemberModule],
  controllers: [OrganizationSessionController],
  providers: [OrganizationSessionService],
  exports: [OrganizationSessionService],
})
export class OrganizationSessionModule {}
