import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationMember } from "./entities/organization-member.entity";
import { OrganizationMemberRepository } from "./repositories/member.repository";
import { OrganizationMemberService } from "./services/member.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMember])],
  providers: [OrganizationMemberService, OrganizationMemberRepository],
  exports: [OrganizationMemberService, OrganizationMemberRepository, TypeOrmModule],
})
export class OrganizationMemberModule {}
