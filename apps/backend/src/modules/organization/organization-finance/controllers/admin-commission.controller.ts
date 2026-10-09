import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import { UpdateOrganizationCommissionSchema, type UpdateOrganizationCommissionDto } from "@orgatick/contracts";
import { OrganizationFinanceService } from "../services/finance.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id/commission")
export class AdminCommissionController {
  constructor(private readonly financeService: OrganizationFinanceService) {}

  @Get()
  async getCommission(@Param("id") id: string) {
    const orgId = BigInt(id);
    return await this.financeService.getCommission(orgId);
  }

  @Patch()
  async updateCommission(
    @Param("id") id: string,
    @Body({ schema: UpdateOrganizationCommissionSchema })
    dto: UpdateOrganizationCommissionDto,
  ) {
    const orgId = BigInt(id);
    return await this.financeService.updateCommission(orgId, dto.commissionPercentage);
  }
}
