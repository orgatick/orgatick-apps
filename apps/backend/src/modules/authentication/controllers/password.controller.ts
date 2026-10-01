import { Body, Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import {
  type ChangePasswordDto,
  type ForgotPasswordDTO,
  type ResetPasswordDTO,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@orgatick/contracts";
import { ClientInfo, type ClientMetadata } from "../../../common/decorators/client-info.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { AUTH_RATE_LIMIT_POLICIES } from "../../../infrastructure/rate-limit/constants/policies/auth.policy";
import { RateLimit } from "../../../infrastructure/rate-limit/decorators/rate-limit.decorator";
import { PasswordService } from "../services/password.service";

@Controller("auth/password")
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post(["change", "change-password"])
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: AuthRequest,
    @Body({ schema: changePasswordSchema }) changePasswordDto: ChangePasswordDto,
    @ClientInfo() clientInfo: ClientMetadata,
  ) {
    return await this.passwordService.changePassword(req.user.id, req.session.id, changePasswordDto, clientInfo);
  }

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.passwordReset, AUTH_RATE_LIMIT_POLICIES.passwordResetAccount])
  @Post(["forgot", "forgot-password"])
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body({ schema: forgotPasswordSchema }) forgotPasswordDto: ForgotPasswordDTO) {
    return await this.passwordService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @RateLimit([AUTH_RATE_LIMIT_POLICIES.passwordReset, AUTH_RATE_LIMIT_POLICIES.passwordResetAccount])
  @Post(["reset", "reset-password"])
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body({ schema: resetPasswordSchema }) resetPasswordDto: ResetPasswordDTO,
    @ClientInfo() clientInfo: ClientMetadata,
  ) {
    return await this.passwordService.resetPassword(resetPasswordDto, clientInfo);
  }
}
