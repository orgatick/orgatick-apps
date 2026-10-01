import { Injectable } from "@nestjs/common";
import type { LoginDTO, SignupDTO } from "@orgatick/contracts";
import type { Request, Response } from "express";
import type { ClientMetadata } from "../../../common/decorators/client-info.decorator";
import { EmailVerificationService } from "./email-verification.service";
import { GoogleOAuthService } from "./oauth-google.service";
import { TokenRefreshService } from "./token-refresh.service";
import { UserLoginService } from "./user-login.service";
import { UserLogoutService } from "./user-logout.service";
import { UserRegistrationService } from "./user-registration.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRegistrationService: UserRegistrationService,
    private readonly userLoginService: UserLoginService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly userLogoutService: UserLogoutService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  async registerUser(registerUserDto: SignupDTO) {
    return this.userRegistrationService.registerUser(registerUserDto);
  }

  async loginUser(loginUserDto: LoginDTO, response: Response, clientInfo?: ClientMetadata) {
    return this.userLoginService.loginUser(loginUserDto, response, clientInfo);
  }

  async emailVerification(token: string, email: string) {
    return this.emailVerificationService.emailVerification(token, email);
  }

  async resendVerificationEmail(email: string) {
    return this.emailVerificationService.resendVerificationEmail(email);
  }

  async refreshToken(request: Request, response: Response) {
    return this.tokenRefreshService.refreshToken(request, response);
  }

  async logoutUser(response: Response, sessionId?: number, userId?: number) {
    return this.userLogoutService.logoutUser(response, sessionId, userId);
  }

  redirectToGoogleOAuth(request: Request) {
    return this.googleOAuthService.redirectToGoogleOAuth(request);
  }

  async authenticateWithGoogle(code: string, response?: Response, clientInfo?: ClientMetadata) {
    return this.googleOAuthService.authenticateWithGoogle(code, response, clientInfo);
  }
}
