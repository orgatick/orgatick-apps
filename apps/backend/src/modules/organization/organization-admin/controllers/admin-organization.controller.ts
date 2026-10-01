import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { AdminOrganizationService } from "../services/admin-organization.service";
import {
  AdminOrganizationQuerySchema,
  UpdateOrganizationStatusSchema,
  type AdminOrganizationQueryDto,
  type UpdateOrganizationStatusDto,
} from "../dto/admin-organization.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations")
export class AdminOrganizationController {
  constructor(private readonly adminOrganizationService: AdminOrganizationService) {}

  @Get()
  async findAll(@Query({ schema: AdminOrganizationQuerySchema }) query: AdminOrganizationQueryDto) {
    return this.adminOrganizationService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.adminOrganizationService.findById(BigInt(id));
  }

  @Patch(":id/status")
  async updateStatus(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: UpdateOrganizationStatusSchema }) dto: UpdateOrganizationStatusDto,
  ) {
    return this.adminOrganizationService.updateStatus(BigInt(id), dto.status, dto.reason, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }
}
