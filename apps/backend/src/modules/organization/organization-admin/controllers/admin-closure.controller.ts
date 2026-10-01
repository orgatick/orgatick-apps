import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AdminClosureService } from "../services/admin-closure.service";
import {
  ClosureRequestSchema,
  ClosureDecisionSchema,
  type ClosureRequestDto,
  type ClosureDecisionDto,
} from "../dto/admin-access.dto";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id")
export class AdminClosureController {
  constructor(private readonly adminClosureService: AdminClosureService) {}

  @Post("closure")
  async requestClosure(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ClosureRequestSchema }) dto: ClosureRequestDto,
  ) {
    return this.adminClosureService.requestClosure(BigInt(id), dto.reason, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Patch("closure/approve")
  async approveClosure(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ClosureDecisionSchema }) dto: ClosureDecisionDto,
  ) {
    return this.adminClosureService.approveClosure(
      BigInt(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.note,
    );
  }

  @Patch("closure/reject")
  async rejectClosure(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ClosureDecisionSchema }) dto: ClosureDecisionDto,
  ) {
    return this.adminClosureService.rejectClosure(
      BigInt(id),
      { id: BigInt(req.user.id), name: req.user.name },
      dto.reason,
    );
  }

  @Delete("permanent")
  async permanentlyDelete(@Param("id") id: string) {
    return this.adminClosureService.permanentlyDelete(BigInt(id));
  }
}
