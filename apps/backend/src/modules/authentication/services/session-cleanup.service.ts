import { type Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import type Redis from "ioredis";
import type { Repository } from "typeorm";
import { REDIS_CLIENT } from "@/infrastructure/redis/redis.constants";
import { UserLoginAttempt } from "@/modules/identity/entities/user-login-attempt.entity";
import { UserSession } from "@/modules/identity/entities/user-session.entity";
import { UserVerification } from "@/modules/identity/entities/user-verification.entity";

export interface CleanupResult {
  expiredSessionsDeleted: number;
  revokedSessionsDeleted: number;
  verificationsDeleted: number;
  loginAttemptsDeleted: number;
  durationMs: number;
}

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private readonly LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes distributed lock TTL
  private readonly BATCH_SIZE = 500; // Safe chunk size to avoid locking tables
  private readonly BATCH_DELAY_MS = 50; // Pause between chunks to prevent CPU/WAL saturation
  private readonly REVOKED_SESSION_RETENTION_DAYS = 7; // Keep revoked sessions 7 days for audit
  private readonly VERIFICATION_RETENTION_DAYS = 7; // Keep used/expired tokens 7 days
  private readonly LOGIN_ATTEMPT_RETENTION_DAYS = 90; // Keep login attempts 90 days

  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserVerification)
    private readonly userVerificationRepository: Repository<UserVerification>,
    @InjectRepository(UserLoginAttempt)
    private readonly userLoginAttemptRepository: Repository<UserLoginAttempt>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  /**
   * Hourly lightweight cleanup job: removes expired sessions.
   * Runs at minute 0 of every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCleanup(): Promise<void> {
    const lockKey = "cron:lock:hourly_session_cleanup";
    const acquired = await this.acquireLock(lockKey);
    if (!acquired) {
      this.logger.debug("Hourly session cleanup lock already acquired by another worker instance. Skipping.");
      return;
    }

    try {
      this.logger.log("Starting scheduled hourly expired session cleanup...");
      const startTime = Date.now();
      const expiredCount = await this.cleanExpiredSessions();
      const elapsed = Date.now() - startTime;
      this.logger.log(`Hourly expired session cleanup completed: removed ${expiredCount} sessions in ${elapsed}ms.`);
    } catch (error) {
      this.logger.error(
        `Error during hourly session cleanup: ${error}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Daily comprehensive cleanup job:
   * - Cleans revoked sessions older than 7 days
   * - Cleans expired/verified verification records older than 7 days
   * - Purges login audit attempts older than 90 days
   * Runs every day at 3:00 AM UTC.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCleanup(): Promise<void> {
    const lockKey = "cron:lock:daily_session_cleanup";
    const acquired = await this.acquireLock(lockKey);
    if (!acquired) {
      this.logger.debug("Daily session cleanup lock already acquired by another worker instance. Skipping.");
      return;
    }

    try {
      this.logger.log("Starting scheduled daily comprehensive maintenance cleanup...");
      const startTime = Date.now();

      const [expiredSessions, revokedSessions, verifications, loginAttempts] = await Promise.all([
        this.cleanExpiredSessions(),
        this.cleanRevokedSessions(this.REVOKED_SESSION_RETENTION_DAYS),
        this.cleanOldVerifications(this.VERIFICATION_RETENTION_DAYS),
        this.cleanOldLoginAttempts(this.LOGIN_ATTEMPT_RETENTION_DAYS),
      ]);

      const elapsed = Date.now() - startTime;
      this.logger.log(
        `Daily maintenance cleanup completed in ${elapsed}ms: ` +
          `expiredSessions=${expiredSessions}, revokedSessions=${revokedSessions}, ` +
          `verifications=${verifications}, loginAttempts=${loginAttempts}.`,
      );
    } catch (error) {
      this.logger.error(`Error during daily cleanup: ${error}`, error instanceof Error ? error.stack : undefined);
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Manual trigger method for admin or testing.
   */
  async runManualCleanup(): Promise<CleanupResult> {
    const startTime = Date.now();
    const expiredSessionsDeleted = await this.cleanExpiredSessions();
    const revokedSessionsDeleted = await this.cleanRevokedSessions(this.REVOKED_SESSION_RETENTION_DAYS);
    const verificationsDeleted = await this.cleanOldVerifications(this.VERIFICATION_RETENTION_DAYS);
    const loginAttemptsDeleted = await this.cleanOldLoginAttempts(this.LOGIN_ATTEMPT_RETENTION_DAYS);

    return {
      expiredSessionsDeleted,
      revokedSessionsDeleted,
      verificationsDeleted,
      loginAttemptsDeleted,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Safely deletes expired sessions in batches and evicts their Redis cache entries.
   */
  private async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    let totalDeleted = 0;

    while (true) {
      const records = await this.userSessionRepository
        .createQueryBuilder("session")
        .select("session.id")
        .where("session.expiresAt IS NOT NULL AND session.expiresAt < :now", { now })
        .limit(this.BATCH_SIZE)
        .getMany();

      if (!records || records.length === 0) break;

      const ids = records.map((s) => s.id);

      await this.userSessionRepository
        .createQueryBuilder()
        .delete()
        .from(UserSession)
        .where("id IN (:...ids)", { ids })
        .execute();

      // Invalidate Redis cache keys for deleted sessions
      await Promise.all(ids.map((id) => this.cacheManager.del(`session:${id}`)));

      totalDeleted += ids.length;
      if (ids.length < this.BATCH_SIZE) break;

      await this.sleep(this.BATCH_DELAY_MS);
    }

    return totalDeleted;
  }

  /**
   * Safely deletes revoked sessions older than retention cutoff in batches.
   */
  private async cleanRevokedSessions(retentionDays: number): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let totalDeleted = 0;

    while (true) {
      const records = await this.userSessionRepository
        .createQueryBuilder("session")
        .select("session.id")
        .where("session.revokedAt IS NOT NULL AND session.revokedAt < :cutoff", { cutoff })
        .limit(this.BATCH_SIZE)
        .getMany();

      if (!records || records.length === 0) break;

      const ids = records.map((s) => s.id);

      await this.userSessionRepository
        .createQueryBuilder()
        .delete()
        .from(UserSession)
        .where("id IN (:...ids)", { ids })
        .execute();

      await Promise.all(ids.map((id) => this.cacheManager.del(`session:${id}`)));

      totalDeleted += ids.length;
      if (ids.length < this.BATCH_SIZE) break;

      await this.sleep(this.BATCH_DELAY_MS);
    }

    return totalDeleted;
  }

  /**
   * Safely deletes old verification/password-reset records older than retention cutoff in batches.
   */
  private async cleanOldVerifications(retentionDays: number): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let totalDeleted = 0;

    while (true) {
      const records = await this.userVerificationRepository
        .createQueryBuilder("v")
        .select("v.id")
        .where("(v.expiresAt < :cutoff OR (v.verifiedAt IS NOT NULL AND v.verifiedAt < :cutoff))", { cutoff })
        .limit(this.BATCH_SIZE)
        .getMany();

      if (!records || records.length === 0) break;

      const ids = records.map((v) => v.id);

      await this.userVerificationRepository
        .createQueryBuilder()
        .delete()
        .from(UserVerification)
        .where("id IN (:...ids)", { ids })
        .execute();

      totalDeleted += ids.length;
      if (ids.length < this.BATCH_SIZE) break;

      await this.sleep(this.BATCH_DELAY_MS);
    }

    return totalDeleted;
  }

  /**
   * Safely purges login attempt audit logs older than retention cutoff in batches.
   */
  private async cleanOldLoginAttempts(retentionDays: number): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let totalDeleted = 0;

    while (true) {
      const records = await this.userLoginAttemptRepository
        .createQueryBuilder("attempt")
        .select("attempt.id")
        .where("attempt.attemptedAt < :cutoff", { cutoff })
        .limit(this.BATCH_SIZE)
        .getMany();

      if (!records || records.length === 0) break;

      const ids = records.map((a) => a.id);

      await this.userLoginAttemptRepository
        .createQueryBuilder()
        .delete()
        .from(UserLoginAttempt)
        .where("id IN (:...ids)", { ids })
        .execute();

      totalDeleted += ids.length;
      if (ids.length < this.BATCH_SIZE) break;

      await this.sleep(this.BATCH_DELAY_MS);
    }

    return totalDeleted;
  }

  private async acquireLock(key: string): Promise<boolean> {
    try {
      const res = await this.redis.set(key, process.pid.toString(), "PX", this.LOCK_TTL_MS, "NX");
      return res === "OK";
    } catch (err) {
      this.logger.warn(`Failed to acquire distributed lock for "${key}": ${err}`);
      return false;
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Failed to release lock "${key}": ${err}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
