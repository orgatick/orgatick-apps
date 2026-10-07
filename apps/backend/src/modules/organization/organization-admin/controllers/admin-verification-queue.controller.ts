import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import { AdminVerificationService } from "../services/admin-verification.service";
import { AdminVerificationQuerySchema, type AdminVerificationQueryDto } from "../dto/admin-verification.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin/verifications")
export class AdminVerificationQueueController {
  constructor(private readonly adminVerificationService: AdminVerificationService) {}

  @Get()
  async queue(@Query({ schema: AdminVerificationQuerySchema }) query: AdminVerificationQueryDto) {
    return this.adminVerificationService.queue(query);
  }
}
