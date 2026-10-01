import { Module } from "@nestjs/common";
import { PlatformAdminGuard } from "../../common/authorization/guards/platform-admin.guard";
import { DashboardController } from "./controllers/dashboard.controller";
import { DashboardService } from "./services/dashboard.service";
import { DashboardRepository } from "./repositories/dashboard.repository";

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, PlatformAdminGuard],
})
export class DashboardModule {}
