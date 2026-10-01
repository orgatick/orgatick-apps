import { Body, Controller, Get, HttpCode, Post, Query, Request, Res } from "@nestjs/common";
import {
  type LoginDTO,
  type ResendVerifyEmailDTO,
  type SignupDTO,
  type VerifyEmailDTO,
  resendVerifyEmailSchema,
  signupSchema,
  verifyEmailSchema,
} from "@orgatick/contracts";
import type { Request as ExpressRequest, Response } from "express";
import { ClientInfo, type ClientMetadata } from "../../../common/decorators/client-info.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { AUTH_RATE_LIMIT_POLICIES } from "../../../infrastructure/rate-limit/constants/policies/auth.policy";
import { RateLimit } from "../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { AuthenticationService } from "../services/authentication.service";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.register, AUTH_RATE_LIMIT_POLICIES.registerAccount])
  @Post("register")
  async registerUser(@Body({ schema: signupSchema }) registerUserDto: SignupDTO) {
    return await this.authenticationService.registerUser(registerUserDto);
  }

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.login, AUTH_RATE_LIMIT_POLICIES.loginAccount])
  @Post("login")
  @HttpCode(200)
  async loginUser(
    @Res({ passthrough: true }) response: Response,
    @Body() loginUserDto: LoginDTO,
    @ClientInfo() clientInfo: ClientMetadata,
  ) {
    const user = await this.authenticationService.loginUser(loginUserDto, response, clientInfo);
    return user;
  }

  @Public()
  @Get("google")
  redirectToGoogle(@Request() req: ExpressRequest, @Res() res: Response) {
    const authUrl = this.authenticationService.redirectToGoogleOAuth(req);
    return res.redirect(authUrl);
  }

  @Public()
  @Get("google/url")
  getGoogleAuthUrl(@Request() req: ExpressRequest) {
    const url = this.authenticationService.redirectToGoogleOAuth(req);
    return { url };
  }

  @Public()
  @RateLimit(AUTH_RATE_LIMIT_POLICIES.login)
  @Post("google/callback")
  @HttpCode(200)
  async googleCallbackPost(
    @Body("code") code: string,
    @Res({ passthrough: true }) response: Response,
    @ClientInfo() clientInfo: ClientMetadata,
  ) {
    return await this.authenticationService.authenticateWithGoogle(code, response, clientInfo);
  }

  @Public()
  @RateLimit(AUTH_RATE_LIMIT_POLICIES.login)
  @Get("google/callback")
  async googleCallbackGet(
    @Query("code") code: string,
    @Res({ passthrough: true }) response: Response,
    @ClientInfo() clientInfo: ClientMetadata,
  ) {
    return await this.authenticationService.authenticateWithGoogle(code, response, clientInfo);
  }

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.emailVerification, AUTH_RATE_LIMIT_POLICIES.emailVerificationAccount])
  @Post("verify-email")
  @HttpCode(200)
  async verifyEmail(@Body({ schema: verifyEmailSchema }) verifyEmailDto: VerifyEmailDTO) {
    return await this.authenticationService.emailVerification(verifyEmailDto.token, verifyEmailDto.email);
  }

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.emailVerification, AUTH_RATE_LIMIT_POLICIES.emailVerificationAccount])
  @Post("resend-verification")
  @HttpCode(200)
  async resendVerification(@Body({ schema: resendVerifyEmailSchema }) resendVerificationDto: ResendVerifyEmailDTO) {
    await this.authenticationService.resendVerificationEmail(resendVerificationDto.email);
    return "Verification email sent successfully";
  }

  @Public()
  @RateLimit(AUTH_RATE_LIMIT_POLICIES.login)
  @Post("refresh")
  @HttpCode(200)
  async refreshToken(@Res({ passthrough: true }) response: Response, @Request() req: AuthRequest) {
    await this.authenticationService.refreshToken(req, response);
    return "Access token refreshed successfully";
  }

  @Post("logout")
  @HttpCode(200)
  async logoutUser(@Res({ passthrough: true }) response: Response, @Request() req: AuthRequest) {
    await this.authenticationService.logoutUser(response, req.session?.id, req.user?.id);
    return "Logged out successfully";
  }
}
