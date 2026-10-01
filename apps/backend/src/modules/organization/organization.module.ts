import { Module } from "@nestjs/common";
import { OrganizationRootModule } from "./organization/organization.module";
import { OrganizationCategoryModule } from "./organization-category/organization-category.module";
import { OrganizationMemberModule } from "./organization-member/organization-member.module";
import { OrganizationInvitationModule } from "./organization-invitation/organization-invitation.module";
import { OrganizationGovernanceModule } from "./organization-governance/organization-governance.module";
import { OrganizationFinanceModule } from "./organization-finance/organization-finance.module";
import { OrganizationSessionModule } from "./organization-session/organization-session.module";

@Module({
  imports: [
    OrganizationRootModule,
    OrganizationCategoryModule,
    OrganizationMemberModule,
    OrganizationInvitationModule,
    OrganizationGovernanceModule,
    OrganizationFinanceModule,
    OrganizationSessionModule,
  ],
  exports: [
    OrganizationRootModule,
    OrganizationCategoryModule,
    OrganizationMemberModule,
    OrganizationInvitationModule,
    OrganizationGovernanceModule,
    OrganizationFinanceModule,
    OrganizationSessionModule,
  ],
})
export class OrganizationModule {}
