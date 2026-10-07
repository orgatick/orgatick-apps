import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { AdminReportService } from "../services/admin-report.service";
import {
  AdminReportQuerySchema,
  RejectReportSchema,
  ResolveReportSchema,
  SubmitReportSchema,
  UpdateReportStatusSchema,
} from "../dto/admin-report.dto";
import type {
  AdminReportQueryDto,
  RejectReportDto,
  ResolveReportDto,
  SubmitReportDto,
  UpdateReportStatusDto,
} from "../dto/admin-report.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin/reports")
export class AdminReportController {
  constructor(private readonly adminReportService: AdminReportService) {}

  @Get()
  async findAll(@Query({ schema: AdminReportQuerySchema }) query: AdminReportQueryDto) {
    return this.adminReportService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.adminReportService.findById(BigInt(id));
  }

  @Patch(":id/status")
  async updateStatus(@Param("id") id: string, @Body({ schema: UpdateReportStatusSchema }) dto: UpdateReportStatusDto) {
    return this.adminReportService.setStatus(BigInt(id), dto.status);
  }

  @Patch(":id/resolve")
  async resolve(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ResolveReportSchema }) dto: ResolveReportDto,
  ) {
    return this.adminReportService.resolve(BigInt(id), dto.resolution, BigInt(req.user.id));
  }

  @Patch(":id/reject")
  async reject(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: RejectReportSchema }) dto: RejectReportDto,
  ) {
    return this.adminReportService.reject(BigInt(id), dto.reason, BigInt(req.user.id));
  }
}

@Controller("organizations/:id")
export class ReportSubmissionController {
  constructor(private readonly adminReportService: AdminReportService) {}

  @Post("reports")
  async submit(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: SubmitReportSchema }) dto: SubmitReportDto,
  ) {
    return this.adminReportService.submit(BigInt(id), BigInt(req.user.id), dto);
  }
}
