import crypto from "node:crypto";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import type { ChangePasswordDto, ForgotPasswordDTO, ResetPasswordDTO } from "@orgatick/contracts";
import * as bcrypt from "bcrypt";
import type { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { BcryptUtils } from "@/common/utils/bcrypt.utils";
import { User } from "@/modules/users/entities/user.entity";
import { AuthProvider, UserAccount } from "@/modules/identity/entities/user-account.entity";
import { UserSecurity } from "@/modules/identity/entities/user-security.entity";
import {
  UserVerification,
  VerificationPurpose,
  VerificationType,
} from "@/modules/identity/entities/user-verification.entity";
import { SessionService } from "./session.service";
import { MailService } from "@/infrastructure/mail/mail.service";
import { parseDeviceName } from "@/common/utils/user-agent.util";
import { normalizeEmail } from "@/common/utils/email.util";
import type { ClientMetadata } from "@/common/decorators/client-info.decorator";

import { AuthThrottleService } from "./auth-throttle.service";

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;
  private readonly bcryptUtils = new BcryptUtils();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
    @InjectRepository(UserVerification)
    private readonly userVerificationRepository: Repository<UserVerification>,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly authThrottleService: AuthThrottleService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  @Transactional()
  async changePassword(userId: number, currentSessionId: number, dto: ChangePasswordDto, clientInfo?: ClientMetadata) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const userAccount = await this.userAccountRepository.findOne({ where: { userId } });
    if (!userAccount?.passwordHash) {
      throw new BadRequestException("Password login is not configured for this account");
    }

    const isCurrentValid = await this.verifyPassword(dto.currentPassword, userAccount.passwordHash);
    if (!isCurrentValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const isSamePassword = await this.verifyPassword(dto.newPassword, userAccount.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException("New password cannot be the same as current password");
    }

    userAccount.passwordHash = await this.hashPassword(dto.newPassword);
    await this.userAccountRepository.save(userAccount);

    const changeDate = new Date();

    // Update security record timestamp
    const userSecurity = await this.userSecurityRepository.findOne({ where: { userId } });
    if (userSecurity) {
      userSecurity.lastPasswordChangeAt = changeDate;
      await this.userSecurityRepository.save(userSecurity);
    } else {
      await this.userSecurityRepository.save({
        userId,
        lastPasswordChangeAt: changeDate,
      });
    }

    // Policy: Revoke all other active sessions (keeping current session valid)
    let revokedSessionsCount = 0;
    const shouldRevokeOthers = dto.revokeOtherSessions ?? true;
    if (shouldRevokeOthers && currentSessionId) {
      const result = await this.sessionService.revokeOtherSessions(userId, currentSessionId);
      revokedSessionsCount = result.revokedCount;
    }

    // Send security alert email with template "password-change"
    const device =
      clientInfo?.deviceName || (clientInfo?.userAgent ? parseDeviceName(clientInfo.userAgent) : null) || "unknown";
    const ipAddress = clientInfo?.ipAddress || "unknown";
    const location = "unknown";
    const appUrl = this.configService.get<string>("APP_URL") || "https://orgatick.in";
    const secureAccountUrl = this.configService.get<string>("SECURE_ACCOUNT_URL") || `${appUrl}/security`;
    const supportEmail = this.configService.get<string>("SUPPORT_EMAIL") || "support@orgatick.in";

    await this.mailService.sendTemplate({
      to: user.email,
      templateId: "password-change",
      variables: {
        changedAt: changeDate.toUTCString(),
        device,
        email: user.email,
        ipAddress,
        location,
        name: user.name || "User",
        secureAccountUrl,
        supportEmail,
      },
    });

    return {
      message: "Password changed successfully",
      revokedOtherSessions: shouldRevokeOthers,
      revokedSessionsCount,
    };
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const normalizedEmail = normalizeEmail(dto.email);
    const user = await this.userRepository.findOne({
      where: { normalizedEmail },
      relations: {
        userAccount: true,
      },
    });

    // Protect against timing/email enumeration attacks by returning consistent message
    if (!user?.userAccount?.passwordHash) {
      return { message: "If an account with that email exists, a password reset link has been sent." };
    }

    const recentVerification = await this.userVerificationRepository.findOne({
      where: { userId: user.id, type: VerificationType.EMAIL, purpose: VerificationPurpose.CHANGE },
      order: { createdAt: "DESC" },
    });

    if (recentVerification) {
      const cooldownMs = 2 * 60 * 1000; // 2 minute cooldown
      const timeSinceLast = Date.now() - new Date(recentVerification.createdAt).getTime();
      if (timeSinceLast < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - timeSinceLast) / 1000);
        throw new BadRequestException(
          `Please wait ${retryAfterSeconds} seconds before requesting another password reset email.`,
        );
      }
    }

    // Remove any existing pending unverified password reset tokens
    await this.userVerificationRepository
      .createQueryBuilder()
      .delete()
      .from(UserVerification)
      .where("user_id = :userId", { userId: user.id })
      .andWhere("type = :type", { type: VerificationType.EMAIL })
      .andWhere("purpose = :purpose", { purpose: VerificationPurpose.CHANGE })
      .andWhere("verified_at IS NULL")
      .execute();

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await this.bcryptUtils.hashString(token);

    await this.userVerificationRepository.save({
      userId: user.id,
      tokenHash,
      type: VerificationType.EMAIL,
      purpose: VerificationPurpose.CHANGE,
      target: user.email,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      attempts: 0,
    });

    const baseUrl = this.configService.get<string>("APP_URL") || "https://orgatick.in";
    await this.mailService.sendTemplate({
      to: user.email,
      templateId: "password-reset",
      variables: {
        name: user.name,
        reset_url: `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`,
      },
    });

    return { message: "If an account with that email exists, a password reset link has been sent." };
  }

  @Transactional()
  async resetPassword(dto: ResetPasswordDTO, clientInfo?: ClientMetadata) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const normalizedEmail = normalizeEmail(dto.email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const verifications = await this.userVerificationRepository.find({
      where: { userId: user.id, type: VerificationType.EMAIL, purpose: VerificationPurpose.CHANGE },
      order: { createdAt: "DESC" },
    });

    if (!verifications || verifications.length === 0) {
      throw new BadRequestException("No pending password reset request found");
    }

    let matchingRecord: UserVerification | null = null;
    for (const record of verifications) {
      const isMatch = await this.bcryptUtils.compareString(dto.token, record.tokenHash);
      if (isMatch) {
        matchingRecord = record;
        break;
      }
    }

    if (!matchingRecord) {
      for (const record of verifications) {
        if (!record.verifiedAt) {
          record.attempts = (record.attempts || 0) + 1;
          await this.userVerificationRepository.save(record);
        }
      }
      throw new UnauthorizedException("Invalid or expired password reset token");
    }

    // Explicit reuse prevention: reject if this token was already verified/used
    if (matchingRecord.verifiedAt !== null) {
      throw new BadRequestException(
        "This password reset token has already been used. Password reset tokens are single-use only. Please request a new password reset link.",
      );
    }

    if (matchingRecord.attempts >= 5) {
      throw new BadRequestException("Reset attempts limit exceeded. Please request a new password reset link.");
    }

    if (matchingRecord.expiresAt < new Date()) {
      throw new BadRequestException("Password reset token has expired. Please request a new password reset link.");
    }

    // Atomic consumption: conditionally mark token as verified to prevent concurrent race condition reuse
    const consumeResult = await this.userVerificationRepository
      .createQueryBuilder()
      .update(UserVerification)
      .set({ verifiedAt: new Date() })
      .where("id = :id AND verified_at IS NULL", { id: matchingRecord.id })
      .execute();

    if (consumeResult.affected === 0) {
      throw new BadRequestException("This password reset token has already been used.");
    }

    // Invalidate any other pending unverified password reset tokens for this user
    await this.userVerificationRepository
      .createQueryBuilder()
      .delete()
      .from(UserVerification)
      .where("user_id = :userId AND id != :id", { userId: user.id, id: matchingRecord.id })
      .andWhere("type = :type", { type: VerificationType.EMAIL })
      .andWhere("purpose = :purpose", { purpose: VerificationPurpose.CHANGE })
      .andWhere("verified_at IS NULL")
      .execute();

    // Update password
    const newHash = await this.hashPassword(dto.password);
    const userAccount = await this.userAccountRepository.findOne({ where: { userId: user.id } });
    if (userAccount) {
      userAccount.passwordHash = newHash;
      await this.userAccountRepository.save(userAccount);
    } else {
      await this.userAccountRepository.save({
        userId: user.id,
        provider: AuthProvider.PASSWORD,
        passwordHash: newHash,
      });
    }

    const changeDate = new Date();

    // Update security record timestamp
    const userSecurity = await this.userSecurityRepository.findOne({ where: { userId: user.id } });
    if (userSecurity) {
      userSecurity.lastPasswordChangeAt = changeDate;
      await this.userSecurityRepository.save(userSecurity);
    } else {
      await this.userSecurityRepository.save({
        userId: user.id,
        lastPasswordChangeAt: changeDate,
      });
    }

    // Policy: Revoke ALL existing sessions across all devices on unauthenticated password reset
    const { revokedCount } = await this.sessionService.revokeAllSessions(user.id, "password_reset");

    // Clear any temporary account lockout from prior failed login attempts
    await this.authThrottleService.clearAccountLockout(user.email);

    // Send security alert email with template "password-change"
    const device =
      clientInfo?.deviceName || (clientInfo?.userAgent ? parseDeviceName(clientInfo.userAgent) : null) || "unknown";
    const ipAddress = clientInfo?.ipAddress || "unknown";
    const location = "unknown";
    const appUrl = this.configService.get<string>("APP_URL") || "https://orgatick.in";
    const secureAccountUrl = this.configService.get<string>("SECURE_ACCOUNT_URL") || `${appUrl}/security`;
    const supportEmail = this.configService.get<string>("SUPPORT_EMAIL") || "support@orgatick.in";

    await this.mailService.sendTemplate({
      to: user.email,
      templateId: "password-change",
      variables: {
        changedAt: changeDate.toUTCString(),
        device,
        email: user.email,
        ipAddress,
        location,
        name: user.name || "User",
        secureAccountUrl,
        supportEmail,
      },
    });

    return {
      message: "Password has been reset successfully. All active sessions have been revoked.",
      revokedSessionsCount: revokedCount,
    };
  }
}
