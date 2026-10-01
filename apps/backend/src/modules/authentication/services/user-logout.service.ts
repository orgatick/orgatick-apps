import { Injectable } from "@nestjs/common";
import type { Response } from "express";

import { CookieService } from "./cookies.service";
import { SessionService } from "./session.service";

@Injectable()
export class UserLogoutService {
  constructor(
    private readonly cookieService: CookieService,
    private readonly sessionService: SessionService,
  ) {}

  async logoutUser(response: Response, sessionId?: number, userId?: number) {
    if (sessionId) await this.sessionService.revokeSession(sessionId, userId);
    this.cookieService.clearAuthCookies(response);
  }
}
