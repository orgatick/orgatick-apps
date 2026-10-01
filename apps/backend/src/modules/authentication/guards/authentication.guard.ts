import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";
import { CookieService } from "../services/cookies.service";
import { SessionService } from "../services/session.service";
import { TokenService } from "../services/token.service";
import { UsersService } from "../../users/service/users.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    private readonly cookieService: CookieService,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const token = this.cookieService.getAccessToken(request);
    if (!token) throw new UnauthorizedException("Authentication token missing");

    try {
      const tokenPayload = await this.tokenService.verifyAccessToken(token);
      const user = await this.userService.findOneByEmail(tokenPayload.email);
      if (!user) throw new UnauthorizedException("User not found");
      const session = await this.sessionService.validateSession(user, tokenPayload.sessionId);
      if (!session) throw new UnauthorizedException("Session not found");
      request.user = user;
      request.session = session;
      return true;
    } catch (error) {
      this.cookieService.clearAuthCookies(response);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid authentication session");
    }
  }
}
