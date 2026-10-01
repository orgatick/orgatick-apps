import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { AdminDocumentService } from "../services/admin-document.service";
import {
  RejectDocumentSchema,
  RequestReplacementSchema,
  NoteOnlySchema,
  type RejectDocumentDto,
  type RequestReplacementDto,
  type NoteOnlyDto,
} from "../dto/admin-document.dto";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id/documents")
export class AdminDocumentController {
  constructor(private readonly adminDocumentService: AdminDocumentService) {}

  @Get()
  async listDocuments(@Param("id") id: string) {
    return this.adminDocumentService.listDocuments(BigInt(id));
  }

  @Get(":documentId/url")
  async getDocumentUrl(@Param("id") id: string, @Param("documentId") documentId: string) {
    return this.adminDocumentService.getSignedUrl(BigInt(id), BigInt(documentId));
  }

  @Patch(":documentId/approve")
  async approve(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    //TODO: need to add NoteOnlyDto
    @Body({ schema: NoteOnlySchema }) _dto: NoteOnlyDto,
  ) {
    return this.adminDocumentService.approve(BigInt(id), BigInt(documentId), {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Patch(":documentId/reject")
  async reject(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body({ schema: RejectDocumentSchema }) dto: RejectDocumentDto,
  ) {
    return this.adminDocumentService.reject(BigInt(id), BigInt(documentId), dto.reason, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Patch(":documentId/replacement")
  async requestReplacement(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body({ schema: RequestReplacementSchema }) dto: RequestReplacementDto,
  ) {
    return this.adminDocumentService.requestReplacement(BigInt(id), BigInt(documentId), dto.note, {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }

  @Patch(":documentId/verify")
  async verify(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    //TODO: need to add NoteOnlyDto
    @Body({ schema: NoteOnlySchema }) _dto: NoteOnlyDto,
  ) {
    return this.adminDocumentService.verify(BigInt(id), BigInt(documentId), {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }
}
