import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AdminAccessService } from "../services/admin-access.service";
import { AdminTrackingService } from "../services/admin-tracking.service";
import { AdminNoteService } from "../services/admin-note.service";
import { ReasonSchema, AdminNoteSchema, RestrictSchema, RemoveRestrictionsSchema } from "../dto/admin-access.dto";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id")
export class AdminAccessController {
  constructor(
    private readonly adminAccessService: AdminAccessService,
    private readonly adminTrackingService: AdminTrackingService,
    private readonly adminNoteService: AdminNoteService,
  ) {}

  @Patch("block")
  async block(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ReasonSchema }) dto: { reason: string },
  ) {
    return this.adminAccessService.block(BigInt(id), dto.reason, { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("unblock")
  async unblock(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.adminAccessService.unblock(BigInt(id), { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("hide")
  async hide(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ReasonSchema }) dto: { reason: string },
  ) {
    return this.adminAccessService.hide(BigInt(id), dto.reason, { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("show")
  async show(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.adminAccessService.show(BigInt(id), { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("archive")
  async archive(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: ReasonSchema }) dto: { reason: string },
  ) {
    return this.adminAccessService.archive(BigInt(id), dto.reason, { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("restore")
  async restore(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.adminAccessService.restore(BigInt(id), { id: BigInt(req.user.id), name: req.user.name });
  }

  @Patch("restrict")
  async restrict(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: RestrictSchema }) dto: { capabilities: string[]; reason: string },
  ) {
    return this.adminAccessService.restrict(BigInt(id), dto.capabilities, dto.reason, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Patch("restrictions/remove")
  async removeRestrictions(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: RemoveRestrictionsSchema }) dto: { capabilities: string[] },
  ) {
    return this.adminAccessService.removeRestrictions(BigInt(id), dto.capabilities, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Get("history")
  async history(@Param("id") id: string) {
    return this.adminTrackingService.getHistories(BigInt(id));
  }

  @Get("notes")
  async listNotes(@Param("id") id: string) {
    return this.adminNoteService.listNotes(BigInt(id));
  }

  @Post("notes")
  async addNote(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: AdminNoteSchema }) dto: { note: string },
  ) {
    return this.adminNoteService.addNote(BigInt(id), dto.note, { id: BigInt(req.user.id), name: req.user.name });
  }
}
