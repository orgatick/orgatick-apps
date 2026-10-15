import { BadRequestException, Controller, ForbiddenException, Get, Param, Req } from "@nestjs/common";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { PlatformRole } from "@/modules/users/enums/platform-role.enums";
import { OrganizationMemberService } from "../../organization-member/services/member.service";
import { OrganizationFinanceService } from "../services/finance.service";

@Controller("organizations/:id/commission")
export class OrganizationCommissionController {
  constructor(
    private readonly financeService: OrganizationFinanceService,
    private readonly memberService: OrganizationMemberService,
  ) {}

  @Get()
  async getCommission(@Req() req: AuthRequest, @Param("id") id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    const orgId = BigInt(id);
    const userId = BigInt(req.user.id);

    if (req.user.role !== PlatformRole.ADMIN) {
      const membership = await this.memberService.findActiveMembership(orgId, userId);
      if (!membership) {
        throw new ForbiddenException("You are not an active member of this organization");
      }
    }

    return await this.financeService.getCommission(orgId);
  }
}
