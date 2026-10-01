import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import crypto from "node:crypto";
import { UserSecurity } from "@/modules/identity/entities/user-security.entity";
import { User } from "@/modules/users/entities/user.entity";
import {
  UserVerification,
  VerificationPurpose,
  VerificationType,
} from "@/modules/identity/entities/user-verification.entity";
import { MailService } from "@/infrastructure/mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { BcryptUtils } from "@/common/utils/bcrypt.utils";
import { normalizeEmail } from "@/common/utils/email.util";

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
    @InjectRepository(UserVerification)
    private readonly userVerificationRepository: Repository<UserVerification>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private readonly bcryptUtils = new BcryptUtils();

  @Transactional()
  async emailVerification(token: string, email: string) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) throw new NotFoundException("User not found");
    const userSecurity = await this.userSecurityRepository.findOne({ where: { userId: user.id } });
    if (userSecurity?.isVerified) return { message: "Email is already verified" };
    const verifications = await this.userVerificationRepository.find({
      where: { userId: user.id, type: VerificationType.EMAIL },
    });
    if (!verifications || verifications.length === 0)
      throw new BadRequestException("No pending verification request found");
    let matchingRecord: UserVerification | null = null;
    for (const record of verifications) {
      if (record.verifiedAt) continue;
      const isMatch = await this.bcryptUtils.compareString(token, record.tokenHash);
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
      throw new UnauthorizedException("Invalid verification token");
    }

    if (matchingRecord.attempts >= 5)
      throw new BadRequestException("Verification attempts limit exceeded. Please request a new verification email.");

    if (matchingRecord.expiresAt < new Date())
      throw new BadRequestException("Verification token has expired. Please request a new verification email.");

    if (userSecurity) {
      userSecurity.isVerified = true;
      await this.userSecurityRepository.save(userSecurity);
    } else {
      await this.userSecurityRepository.save({
        userId: user.id,
        isVerified: true,
      });
    }

    matchingRecord.verifiedAt = new Date();
    await this.userVerificationRepository.save(matchingRecord);
    await this.userVerificationRepository.delete({ userId: user.id, type: VerificationType.EMAIL });

    return { message: "Email verified successfully" };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) throw new NotFoundException("User not found");
    const userSecurity = await this.userSecurityRepository.findOne({ where: { userId: user.id } });
    if (userSecurity?.isVerified) throw new BadRequestException("Email is already verified");
    const recentVerification = await this.userVerificationRepository.findOne({
      where: { userId: user.id, type: VerificationType.EMAIL },
      order: { createdAt: "DESC" },
    });

    if (recentVerification) {
      const cooldownMs = 5 * 60 * 1000; // 5 minute cooldown
      const timeSinceLast = Date.now() - new Date(recentVerification.createdAt).getTime();
      if (timeSinceLast < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - timeSinceLast) / 1000);
        throw new BadRequestException(
          `Please wait ${retryAfterSeconds} seconds before requesting another verification email.`,
        );
      }
    }
    await this.createAndSendVerificationToken(user.id, user.email, user.name);
    return { message: "Verification email sent." };
  }

  async createAndSendVerificationToken(userId: number, email: string, name: string) {
    await this.userVerificationRepository.delete({
      userId,
      type: VerificationType.EMAIL,
    });
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await this.bcryptUtils.hashString(token);
    await this.userVerificationRepository.save({
      userId,
      tokenHash,
      type: VerificationType.EMAIL,
      purpose: VerificationPurpose.SIGNUP,
      target: email,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
    });
    const baseUrl = this.configService.get<string>("APP_URL");
    await this.mailService.sendTemplate({
      to: email,
      templateId: "email-verification",
      variables: {
        name,
        verification_url: `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`,
      },
    });
    return token;
  }
}
