import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { VerifyOrganizationBankAccountSchema, type VerifyOrganizationBankAccountDto } from "@orgatick/contracts";
import { OrganizationBankAccountService } from "../services/bank-account.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id/bank-account")
export class AdminBankAccountController {
  constructor(private readonly bankAccountService: OrganizationBankAccountService) {}

  @Get()
  async getBankAccount(@Param("id") id: string) {
    const orgId = BigInt(id);
    return await this.bankAccountService.getBankAccount(orgId, true);
  }

  @Patch("verify")
  async verifyBankAccount(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerifyOrganizationBankAccountSchema })
    dto: VerifyOrganizationBankAccountDto,
  ) {
    const orgId = BigInt(id);
    const actorId = BigInt(req.user.id);
    return await this.bankAccountService.verifyBankAccount(orgId, dto, actorId);
  }
}
