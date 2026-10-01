import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AdminMemberService } from "../services/admin-member.service";
import { AdminOwnershipService } from "../services/admin-ownership.service";
import {
  AddMemberSchema,
  UpdateMemberRoleSchema,
  UpdateMemberStatusSchema,
  TransferOwnershipSchema,
  type AddMemberDto,
  type UpdateMemberRoleDto,
  type UpdateMemberStatusDto,
  type TransferOwnershipDto,
} from "../dto/admin-member.dto";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import type { OrganizationMemberStatus } from "@orgatick/contracts";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id")
export class AdminMemberController {
  constructor(
    private readonly adminMemberService: AdminMemberService,
    private readonly adminOwnershipService: AdminOwnershipService,
  ) {}

  @Get("members")
  async listMembers(@Param("id") id: string) {
    return this.adminMemberService.listMembers(BigInt(id));
  }

  @Post("members")
  async addMember(@Param("id") id: string, @Body({ schema: AddMemberSchema }) dto: AddMemberDto) {
    return this.adminMemberService.addMember(BigInt(id), BigInt(dto.userId), dto.role);
  }

  @Patch("members/:memberId/role")
  async changeRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body({ schema: UpdateMemberRoleSchema }) dto: UpdateMemberRoleDto,
  ) {
    return this.adminMemberService.changeRole(BigInt(id), BigInt(memberId), dto.role);
  }

  @Patch("members/:memberId/status")
  async changeStatus(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body({ schema: UpdateMemberStatusSchema }) dto: UpdateMemberStatusDto,
  ) {
    return this.adminMemberService.changeStatus(BigInt(id), BigInt(memberId), dto.status as OrganizationMemberStatus);
  }

  @Delete("members/:memberId")
  async removeMember(@Param("id") id: string, @Param("memberId") memberId: string) {
    return this.adminMemberService.removeMember(BigInt(id), BigInt(memberId));
  }

  @Post("ownership/transfer")
  async transferOwnership(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: TransferOwnershipSchema }) dto: TransferOwnershipDto,
  ) {
    return this.adminOwnershipService.transfer(BigInt(id), BigInt(dto.toUserId), dto.reason, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Get("ownership/history")
  async ownershipHistory(@Param("id") id: string) {
    return this.adminOwnershipService.history(BigInt(id));
  }
}
