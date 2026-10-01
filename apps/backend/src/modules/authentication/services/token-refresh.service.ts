import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Request, Response } from "express";
import type { Repository } from "typeorm";

import { CookieService } from "./cookies.service";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";
import { User } from "@/modules/users/entities/user.entity";
import { normalizeEmail } from "@/common/utils/email.util";

@Injectable()
export class TokenRefreshService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cookieService: CookieService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async refreshToken(request: Request, response: Response) {
    const refreshToken = this.cookieService.getRefreshToken(request);
    if (!refreshToken) throw new UnauthorizedException("No refresh token found");

    const tokenPayload = await this.tokenService.verifyRefreshToken(refreshToken);

    const normalizedEmail = normalizeEmail(tokenPayload.email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) throw new NotFoundException("User not found");

    const session = await this.sessionService.validateSession(user, tokenPayload.sessionId);

    const token = await this.tokenService.generateAccessToken({
      email: user.email,
      sessionId: session.id,
      token: tokenPayload.token,
    });
    this.cookieService.setAccessToken(response, token);
    await this.sessionService.touchSessionActivity(session.id);
  }
}
