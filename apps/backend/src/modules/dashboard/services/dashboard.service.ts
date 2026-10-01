import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "../repositories/dashboard.repository";

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getPlatformStats() {
    return await this.dashboardRepository.findPlatformStats();
  }
}
