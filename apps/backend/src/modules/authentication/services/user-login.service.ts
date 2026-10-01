import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { LoginDTO } from "@orgatick/contracts";
import type { Response } from "express";
import { User } from "@/modules/users/entities/user.entity";
import { UserAccount } from "@/modules/identity/entities/user-account.entity";
import { UserSecurity } from "@/modules/identity/entities/user-security.entity";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";
import { LoginAttemptService } from "@/modules/identity/service/login-attempt.service";
import { CookieService } from "./cookies.service";
import { UserDeviceService } from "@/modules/identity/service/user-device.service";
import type { ClientMetadata } from "@/common/decorators/client-info.decorator";
import { Transactional } from "typeorm-transactional";
import { normalizeEmail } from "@/common/utils/email.util";
import { LoginAttemptStatus } from "@/modules/identity/entities/user-login-attempt.entity";

@Injectable()
export class UserLoginService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly userDeviceService: UserDeviceService,
  ) {}

  @Transactional()
  async loginUser(loginUserDto: LoginDTO, response: Response, clientInfo?: ClientMetadata) {
    const normalizedEmail = normalizeEmail(loginUserDto.email);
    const user = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (!user) {
      await this.loginAttemptService.recordAttempt({
        email: loginUserDto.email,
        userId: null,
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        status: LoginAttemptStatus.FAILED,
        failureReason: "Invalid credentials",
      });
      throw new NotFoundException("Invalid credentials");
    }
    const userAccount = await this.userAccountRepository.findOne({ where: { userId: user.id } });
    if (!userAccount?.passwordHash) {
      await this.loginAttemptService.recordAttempt({
        email: loginUserDto.email,
        userId: user.id,
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        status: LoginAttemptStatus.FAILED,
        failureReason: "User account not found",
      });
      throw new NotFoundException("Invalid credentials");
    }
    const isPasswordValid = await this.passwordService.verifyPassword(loginUserDto.password, userAccount.passwordHash);
    if (!isPasswordValid) {
      await this.loginAttemptService.recordAttempt({
        email: loginUserDto.email,
        userId: user.id,
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        status: LoginAttemptStatus.FAILED,
        failureReason: "Invalid credentials",
      });
      throw new UnauthorizedException("Invalid credentials");
    }
    const userSecurity = await this.userSecurityRepository.findOne({ where: { userId: user.id } });
    if (!userSecurity?.isVerified) {
      await this.loginAttemptService.recordAttempt({
        email: loginUserDto.email,
        userId: user.id,
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        status: LoginAttemptStatus.FAILED,
        failureReason: "Email not verified",
      });
      throw new UnauthorizedException("Please verify your email before logging in");
    }
    userAccount.lastLoginAt = new Date();
    await this.userAccountRepository.save(userAccount);
    let resolvedDeviceId: string | null = clientInfo?.deviceId ?? null;
    if (clientInfo?.deviceIdentifier) {
      const device = await this.userDeviceService.registerOrUpdateDevice(user.id, {
        deviceIdentifier: clientInfo.deviceIdentifier,
        name: clientInfo.deviceName,
        platform: clientInfo.platform,
      });
      resolvedDeviceId = device.id;
    }
    const sessionClientInfo: ClientMetadata = {
      ipAddress: clientInfo?.ipAddress ?? null,
      userAgent: clientInfo?.userAgent ?? null,
      deviceId: resolvedDeviceId,
    };
    const session = await this.sessionService.createSession(user, sessionClientInfo);
    await this.loginAttemptService.recordAttempt({
      email: loginUserDto.email,
      userId: user.id,
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      status: LoginAttemptStatus.SUCCESS,
      failureReason: null,
    });
    const token = await this.tokenService.generateTokenPair({
      email: user.email,
      sessionId: session.id,
      token: session.sessionToken,
    });
    this.cookieService.setAuthCookies(response, token);
    return user;
  }
}
