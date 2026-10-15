import { BadRequestException, Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { AdminVerificationService } from "../services/admin-verification.service";
import {
  VerificationApproveSchema,
  VerificationRejectSchema,
  VerificationRevokeSchema,
  VerificationDocumentsSchema,
  type VerificationApproveDto,
  type VerificationRejectDto,
  type VerificationRevokeDto,
  type VerificationDocumentsDto,
} from "../dto/admin-verification.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id/verification")
export class AdminVerificationController {
  constructor(private readonly adminVerificationService: AdminVerificationService) {}

  private parseOrgId(id: string): bigint {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    return BigInt(id);
  }

  @Patch("approve")
  async approve(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerificationApproveSchema }) dto: VerificationApproveDto,
  ) {
    return this.adminVerificationService.approve(
      this.parseOrgId(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.note,
    );
  }

  @Patch("reject")
  async reject(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerificationRejectSchema }) dto: VerificationRejectDto,
  ) {
    return this.adminVerificationService.reject(
      this.parseOrgId(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.reason,
    );
  }

  @Patch("revoke")
  async revoke(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerificationRevokeSchema }) dto: VerificationRevokeDto,
  ) {
    return this.adminVerificationService.revoke(
      this.parseOrgId(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.reason,
    );
  }

  @Patch("request-documents")
  async requestDocuments(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerificationDocumentsSchema }) dto: VerificationDocumentsDto,
  ) {
    return this.adminVerificationService.requestDocuments(
      this.parseOrgId(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.note,
    );
  }

  @Patch("reverify")
  async reverify(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: VerificationApproveSchema }) dto: VerificationApproveDto,
  ) {
    return this.adminVerificationService.reverify(
      this.parseOrgId(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.note,
    );
  }

  @Get("history")
  async history(@Param("id") id: string) {
    return this.adminVerificationService.getVerificationHistory(this.parseOrgId(id));
  }
}
