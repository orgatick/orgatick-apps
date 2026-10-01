import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { CookieService } from "../services/cookies.service";
import { SessionService } from "../services/session.service";
import type { RevokeSessionsResponse, SessionResponse } from "@orgatick/contracts";

@Controller(["auth/sessions", "identity/sessions"])
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly cookieService: CookieService,
  ) {}

  @Get()
  async getMySessions(@Req() req: AuthRequest): Promise<SessionResponse[]> {
    return await this.sessionService.getUserSessions(req.user.id, req.session?.id);
  }

  @Get("current")
  async getCurrentSession(@Req() req: AuthRequest): Promise<SessionResponse> {
    return await this.sessionService.getCurrentSession(req.user.id, req.session.id);
  }

  @Delete("other")
  @HttpCode(HttpStatus.OK)
  async revokeOtherSessions(@Req() req: AuthRequest): Promise<RevokeSessionsResponse> {
    const result = await this.sessionService.revokeOtherSessions(req.user.id, req.session.id);
    return {
      message: "All other sessions revoked successfully",
      revokedCount: result.revokedCount,
    };
  }

  @Delete("all")
  @HttpCode(HttpStatus.OK)
  async revokeAllSessionsAlias(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RevokeSessionsResponse> {
    return await this.revokeAllSessions(req, res);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RevokeSessionsResponse> {
    const result = await this.sessionService.revokeAllSessions(req.user.id);
    this.cookieService.clearAuthCookies(res);
    return {
      message: "All sessions revoked successfully",
      revokedCount: result.revokedCount,
    };
  }

  @Delete(":sessionId")
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RevokeSessionsResponse> {
    await this.sessionService.revokeSession(sessionId, req.user.id);
    if (req.session?.id && Number(req.session.id) === sessionId) {
      this.cookieService.clearAuthCookies(res);
    }
    return {
      message: "Session revoked successfully",
    };
  }
}
