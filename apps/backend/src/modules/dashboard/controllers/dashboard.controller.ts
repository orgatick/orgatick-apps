import { Controller, Get, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { DashboardService } from "../services/dashboard.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  async getStats() {
    return await this.dashboardService.getPlatformStats();
  }
}
