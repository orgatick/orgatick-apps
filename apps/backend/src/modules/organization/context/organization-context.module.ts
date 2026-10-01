import { Module } from "@nestjs/common";
import { OrganizationMemberModule } from "../organization-member/organization-member.module";
import { OrganizationContextGuard } from "./guards/organization-context.guard";
import { OrganizationContextCacheService } from "./services/organization-context-cache.service";
import { OrganizationContextCookieService } from "./services/organization-context-cookie.service";
import { OrganizationContextService } from "./services/organization-context.service";

@Module({
  imports: [OrganizationMemberModule],
  providers: [
    OrganizationContextService,
    OrganizationContextCacheService,
    OrganizationContextCookieService,
    OrganizationContextGuard,
  ],
  exports: [OrganizationContextService, OrganizationContextGuard, OrganizationContextCookieService],
})
export class OrganizationContextModule {}
