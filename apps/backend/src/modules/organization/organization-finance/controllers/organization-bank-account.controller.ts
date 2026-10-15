import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Put, Req } from "@nestjs/common";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { PlatformRole } from "@/modules/users/enums/platform-role.enums";
import { SaveOrganizationBankAccountSchema, type SaveOrganizationBankAccountDto } from "@orgatick/contracts";
import { OrganizationMemberService } from "../../organization-member/services/member.service";
import { OrganizationBankAccountService } from "../services/bank-account.service";

@Controller("organizations/:id/bank-account")
export class OrganizationBankAccountController {
  constructor(
    private readonly bankAccountService: OrganizationBankAccountService,
    private readonly memberService: OrganizationMemberService,
  ) {}

  @Get()
  async getBankAccount(@Req() req: AuthRequest, @Param("id") id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    const orgId = BigInt(id);
    const userId = BigInt(req.user.id);

    // Platform admin can view any org bank details
    if (req.user.role !== PlatformRole.ADMIN) {
      const membership = await this.memberService.findActiveMembership(orgId, userId);
      if (!membership) {
        throw new ForbiddenException("You are not an active member of this organization");
      }
    }

    return await this.bankAccountService.getBankAccount(orgId, false);
  }

  @Put()
  async saveBankAccount(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: SaveOrganizationBankAccountSchema })
    dto: SaveOrganizationBankAccountDto,
  ) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    const orgId = BigInt(id);
    const userId = BigInt(req.user.id);

    // Platform admin can update bank details, or organization Owner / Admin
    if (req.user.role !== PlatformRole.ADMIN) {
      const membership = await this.memberService.findActiveMembership(orgId, userId);
      if (!membership) {
        throw new ForbiddenException("You are not an active member of this organization");
      }

      const roleKey = membership.role?.key?.toLowerCase();
      const isOwnerOrAdmin = roleKey === "owner" || roleKey === "admin";
      if (!isOwnerOrAdmin) {
        throw new ForbiddenException("Only organization owners and administrators can manage bank details");
      }
    }

    return await this.bankAccountService.saveBankAccount(orgId, dto, userId);
  }
}
