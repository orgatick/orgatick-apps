import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { AdminOwnershipDisputeService } from "../services/admin-ownership-dispute.service";
import {
  FreezeDisputeSchema,
  OwnershipDisputeQuerySchema,
  RejectDisputeSchema,
  ResolveDisputeSchema,
  SubmitDisputeSchema,
  UpdateDisputeStatusSchema,
} from "../dto/admin-ownership-dispute.dto";
import type {
  FreezeDisputeDto,
  OwnershipDisputeQueryDto,
  RejectDisputeDto,
  ResolveDisputeDto,
  SubmitDisputeDto,
  UpdateDisputeStatusDto,
} from "../dto/admin-ownership-dispute.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin/ownership-disputes")
export class AdminOwnershipDisputeController {
  constructor(private readonly disputeService: AdminOwnershipDisputeService) {}

  @Get()
  async findAll(@Query({ schema: OwnershipDisputeQuerySchema }) query: OwnershipDisputeQueryDto) {
    return this.disputeService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.disputeService.findById(BigInt(id));
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body({ schema: UpdateDisputeStatusSchema }) dto: UpdateDisputeStatusDto,
  ) {
    return this.disputeService.setStatus(BigInt(id), dto.status);
  }

  @Patch(":id/freeze")
  async freeze(@Param("id") id: string, @Body({ schema: FreezeDisputeSchema }) dto: FreezeDisputeDto) {
    return this.disputeService.setFreeze(BigInt(id), dto.frozen);
  }

  @Patch(":id/resolve")
  async resolve(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ResolveDisputeSchema }) dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(BigInt(id), dto, { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch(":id/reject")
  async reject(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: RejectDisputeSchema }) dto: RejectDisputeDto,
  ) {
    return this.disputeService.reject(BigInt(id), dto.reason, { id: BigInt(req.user.id), name: req.user.name });
  }
}

@Controller("organizations/:id")
export class DisputeSubmissionController {
  constructor(private readonly disputeService: AdminOwnershipDisputeService) {}

  @Post("ownership/disputes")
  async submit(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: SubmitDisputeSchema }) dto: SubmitDisputeDto,
  ) {
    return this.disputeService.submit(BigInt(id), BigInt(req.user.id), dto);
  }
}
