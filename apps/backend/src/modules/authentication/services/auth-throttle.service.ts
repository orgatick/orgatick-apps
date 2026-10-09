import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type Redis from "ioredis";
import type { ClientMetadata } from "@/common/decorators/client-info.decorator";
import { normalizeEmail } from "@/common/utils/email.util";
import { parseDeviceName } from "@/common/utils/user-agent.util";
import { MailService } from "@/infrastructure/mail/mail.service";
import { REDIS_CLIENT } from "@/infrastructure/redis/redis.constants";
import { LoginAttemptStatus } from "@/modules/identity/entities/user-login-attempt.entity";
import { LoginAttemptService } from "@/modules/identity/service/login-attempt.service";
import type { User } from "@/modules/users/entities/user.entity";

export interface LockoutInfo {
  isLocked: boolean;
  type?: "account" | "ip" | "device";
  retryAfterSeconds?: number;
  message?: string;
}

@Injectable()
export class AuthThrottleService {
  private readonly logger = new Logger(AuthThrottleService.name);

  // Policy Thresholds
  private readonly ACCOUNT_TIER1_FAILURES = 5; // 5 consecutive failures
  private readonly ACCOUNT_TIER1_LOCK_SECONDS = 15 * 60; // 15 minutes
  private readonly ACCOUNT_TIER2_FAILURES = 10; // 10 consecutive failures
  private readonly ACCOUNT_TIER2_LOCK_SECONDS = 60 * 60; // 1 hour

  private readonly IP_TIER1_FAILURES = 10; // 10 failures from IP
  private readonly IP_TIER1_LOCK_SECONDS = 15 * 60; // 15 minutes
  private readonly IP_TIER2_FAILURES = 25; // 25 failures from IP
  private readonly IP_TIER2_LOCK_SECONDS = 60 * 60; // 1 hour

  private readonly DEVICE_FAILURES = 5; // 5 failures from device
  private readonly DEVICE_LOCK_SECONDS = 15 * 60; // 15 minutes

  private readonly WINDOW_SECONDS = 15 * 60; // 15-minute sliding counter window

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Pre-login validation: verifies that neither the IP, device, nor account is currently locked out.
   * Throws HttpException 429 if any entity is locked.
   */
  async checkPreLogin(rawEmail: string, clientInfo?: ClientMetadata): Promise<void> {
    const email = normalizeEmail(rawEmail);
    const ip = clientInfo?.ipAddress || "unknown";
    const deviceId = clientInfo?.deviceIdentifier || clientInfo?.deviceId || null;

    // 1. Check IP lockout
    const ipLockKey = `auth_lock:ip:${ip}`;
    const ipTtl = await this.redis.ttl(ipLockKey);
    if (ipTtl > 0) {
      this.logger.warn(`Rejected login attempt from locked IP "${ip}". Remaining lock time: ${ipTtl}s.`);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Too many failed login attempts from this IP address. Access temporarily suspended.",
          retryAfter: ipTtl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check Device lockout (if device identified)
    if (deviceId) {
      const devLockKey = `auth_lock:device:${deviceId}`;
      const devTtl = await this.redis.ttl(devLockKey);
      if (devTtl > 0) {
        this.logger.warn(`Rejected login attempt from locked device "${deviceId}". Remaining lock time: ${devTtl}s.`);
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: "Too many failed login attempts from this device. Access temporarily suspended.",
            retryAfter: devTtl,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // 3. Check Account lockout
    const accLockKey = `auth_lock:account:${email}`;
    const accTtl = await this.redis.ttl(accLockKey);
    if (accTtl > 0) {
      const minutesRemaining = Math.ceil(accTtl / 60);
      this.logger.warn(`Rejected login attempt for locked account "${email}". Remaining lock time: ${accTtl}s.`);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s) or reset your password.`,
          retryAfter: accTtl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Records a failed login attempt, increments failure counters for account, IP, and device,
   * enforces progressive lockouts, sends security alerts if necessary, and saves the attempt to the database.
   */
  async recordLoginFailure(
    rawEmail: string,
    user: User | null,
    clientInfo?: ClientMetadata,
    failureReason = "Invalid credentials",
  ): Promise<void> {
    const email = normalizeEmail(rawEmail);
    const ip = clientInfo?.ipAddress || "unknown";
    const deviceId = clientInfo?.deviceIdentifier || clientInfo?.deviceId || null;

    // 1. Audit log in persistent database
    await this.loginAttemptService.recordAttempt({
      email,
      userId: user?.id ?? null,
      ipAddress: clientInfo?.ipAddress ?? null,
      userAgent: clientInfo?.userAgent ?? null,
      status: LoginAttemptStatus.FAILED,
      failureReason,
    });

    try {
      // 2. Increment IP failures and enforce IP policy
      const ipFailKey = `auth_fail:ip:${ip}`;
      const ipFails = await this.incrementCounter(ipFailKey, this.WINDOW_SECONDS);

      if (ipFails >= this.IP_TIER2_FAILURES) {
        await this.redis.set(`auth_lock:ip:${ip}`, "locked", "EX", this.IP_TIER2_LOCK_SECONDS);
        this.logger.error(`IP "${ip}" locked for ${this.IP_TIER2_LOCK_SECONDS}s (${ipFails} failed attempts).`);
      } else if (ipFails >= this.IP_TIER1_FAILURES) {
        await this.redis.set(`auth_lock:ip:${ip}`, "locked", "EX", this.IP_TIER1_LOCK_SECONDS);
        this.logger.warn(`IP "${ip}" locked for ${this.IP_TIER1_LOCK_SECONDS}s (${ipFails} failed attempts).`);
      }

      // 3. Increment Device failures and enforce Device policy (if device present)
      if (deviceId) {
        const devFailKey = `auth_fail:device:${deviceId}`;
        const devFails = await this.incrementCounter(devFailKey, this.WINDOW_SECONDS);

        if (devFails >= this.DEVICE_FAILURES) {
          await this.redis.set(`auth_lock:device:${deviceId}`, "locked", "EX", this.DEVICE_LOCK_SECONDS);
          this.logger.warn(
            `Device "${deviceId}" locked for ${this.DEVICE_LOCK_SECONDS}s (${devFails} failed attempts).`,
          );
        }
      }

      // 4. Increment Account failures and enforce Account policy
      const accFailKey = `auth_fail:account:${email}`;
      const accFails = await this.incrementCounter(accFailKey, this.WINDOW_SECONDS);

      if (accFails >= this.ACCOUNT_TIER2_FAILURES) {
        await this.redis.set(`auth_lock:account:${email}`, "locked", "EX", this.ACCOUNT_TIER2_LOCK_SECONDS);
        this.logger.error(
          `Account "${email}" locked for ${this.ACCOUNT_TIER2_LOCK_SECONDS}s (${accFails} consecutive failures).`,
        );

        // Send security alert email if user exists
        if (user) {
          await this.sendSecurityAlertEmail(user, clientInfo, accFails);
        }
      } else if (accFails >= this.ACCOUNT_TIER1_FAILURES) {
        await this.redis.set(`auth_lock:account:${email}`, "locked", "EX", this.ACCOUNT_TIER1_LOCK_SECONDS);
        this.logger.warn(
          `Account "${email}" locked for ${this.ACCOUNT_TIER1_LOCK_SECONDS}s (${accFails} consecutive failures).`,
        );
      }
    } catch (err) {
      this.logger.error(`Error in Redis auth throttle processing: ${err}`);
    }
  }

  /**
   * Resets account and device failure counters upon successful authentication.
   */
  async recordLoginSuccess(rawEmail: string, userId: number, clientInfo?: ClientMetadata): Promise<void> {
    const email = normalizeEmail(rawEmail);
    const deviceId = clientInfo?.deviceIdentifier || clientInfo?.deviceId || null;

    // 1. Audit log in persistent database
    await this.loginAttemptService.recordAttempt({
      email,
      userId,
      ipAddress: clientInfo?.ipAddress ?? null,
      userAgent: clientInfo?.userAgent ?? null,
      status: LoginAttemptStatus.SUCCESS,
      failureReason: null,
    });

    try {
      // 2. Clear account failures & lock
      await this.redis.del(`auth_fail:account:${email}`, `auth_lock:account:${email}`);

      // 3. Clear device failures & lock
      if (deviceId) {
        await this.redis.del(`auth_fail:device:${deviceId}`, `auth_lock:device:${deviceId}`);
      }
    } catch (err) {
      this.logger.error(`Failed to reset auth failure counters in Redis: ${err}`);
    }
  }

  /**
   * Manually clears the lockout for an account (e.g., following a verified password reset).
   */
  async clearAccountLockout(rawEmail: string): Promise<void> {
    const email = normalizeEmail(rawEmail);
    try {
      await this.redis.del(`auth_fail:account:${email}`, `auth_lock:account:${email}`);
    } catch (err) {
      this.logger.warn(`Failed to clear account lockout for "${email}": ${err}`);
    }
  }

  /**
   * Atomic Redis counter increment with initial TTL setting.
   */
  private async incrementCounter(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, ttlSeconds);
    }
    return count;
  }

  /**
   * Dispatches an account-security alert email after excessive failed attempts.
   */
  private async sendSecurityAlertEmail(user: User, clientInfo?: ClientMetadata, failCount = 10): Promise<void> {
    try {
      const device =
        clientInfo?.deviceName || (clientInfo?.userAgent ? parseDeviceName(clientInfo.userAgent) : null) || "unknown";
      const ipAddress = clientInfo?.ipAddress || "unknown";
      const appUrl = this.configService.get<string>("APP_URL") || "https://orgatick.in";
      const secureAccountUrl = this.configService.get<string>("SECURE_ACCOUNT_URL") || `${appUrl}/security`;
      const supportEmail = this.configService.get<string>("SUPPORT_EMAIL") || "support@orgatick.in";

      await this.mailService.sendTemplate({
        to: user.email,
        templateId: "password-change", // Uses security alert template
        variables: {
          changedAt: new Date().toUTCString(),
          device,
          email: user.email,
          ipAddress,
          location: "unknown",
          name: user.name || "User",
          secureAccountUrl,
          supportEmail,
          alertMessage: `Warning: ${failCount} consecutive failed login attempts detected on your account. Your account has been temporarily locked for 1 hour.`,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send security alert email to ${user.email}: ${err}`);
    }
  }
}
