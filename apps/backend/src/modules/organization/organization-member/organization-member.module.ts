import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationMember } from "./entities/organization-member.entity";
import { OrganizationPermissionGuard } from "./guards/organization-permission.guard";
import { OrganizationMemberRepository } from "./repositories/member.repository";
import { OrganizationMemberService } from "./services/member.service";
import { OrganizationPermissionService } from "./services/organization-permission.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMember])],
  providers: [
    OrganizationMemberService,
    OrganizationPermissionService,
    OrganizationPermissionGuard,
    OrganizationMemberRepository,
  ],
  exports: [
    OrganizationMemberService,
    OrganizationPermissionService,
    OrganizationPermissionGuard,
    OrganizationMemberRepository,
    TypeOrmModule,
  ],
})
export class OrganizationMemberModule {}
