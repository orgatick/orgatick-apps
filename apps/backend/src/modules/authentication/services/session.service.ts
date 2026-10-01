import crypto from "node:crypto";
import { type Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { SessionResponse } from "@orgatick/contracts";
import { BcryptUtils } from "@/common/utils/bcrypt.utils";
import { UserSession } from "@/modules/identity/entities/user-session.entity";
import type { User } from "@/modules/users/entities/user.entity";
import type { ClientMetadata } from "@/common/decorators/client-info.decorator";
import { parseBrowser, parsePlatform } from "@/common/utils/user-agent.util";

@Injectable()
export class SessionService {
  private readonly cacheTTL = 900_000; // Cache TTL in milliseconds (15 minutes)
  private readonly sessionLifespanMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly maxActiveSessions = 6; // Maximum concurrent active sessions per user
  private readonly bcryptUtils = new BcryptUtils();

  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async validateSession(user: User, sessionId: number): Promise<UserSession> {
    const cacheKey = `session:${sessionId}`;
    const cachedSession = await this.cacheManager.get<UserSession>(cacheKey);
    if (cachedSession) {
      await this.validate(cachedSession);
      await this.updateActivityThrottled(cachedSession);
      return cachedSession;
    }

    const session = await this.userSessionRepository.findOne({ where: { userId: user.id, id: sessionId } });
    if (!session) throw new UnauthorizedException("Session not found");
    await this.validate(session);
    await this.updateActivityThrottled(session);
    await this.cacheManager.set(cacheKey, session, this.cacheTTL);
    return session;
  }

  async createSession(user: User, clientInfo?: ClientMetadata): Promise<UserSession & { sessionToken: string }> {
    // Enforce maximum active session limit by revoking oldest/least recently active sessions
    await this.enforceActiveSessionLimit(user.id);

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionTokenHash = await this.bcryptUtils.hashString(sessionToken);
    const session = new UserSession();
    session.userId = user.id;
    session.sessionTokenHash = sessionTokenHash;
    session.lastActivityAt = new Date();
    session.expiresAt = new Date(Date.now() + this.sessionLifespanMs);
    session.ipAddress = clientInfo?.ipAddress ?? null;
    session.userAgent = clientInfo?.userAgent ?? null;
    session.deviceId = clientInfo?.deviceId ?? null;
    await this.userSessionRepository.save(session);
    return { ...session, sessionToken };
  }

  async validate(session: UserSession): Promise<void> {
    if (session.revokedAt) throw new UnauthorizedException("Session revoked");
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) throw new UnauthorizedException("Session expired");
  }

  async touchSessionActivity(sessionId: number): Promise<void> {
    const now = new Date();
    await this.userSessionRepository.update(sessionId, { lastActivityAt: now });
    const cacheKey = `session:${sessionId}`;
    const cachedSession = await this.cacheManager.get<UserSession>(cacheKey);
    if (cachedSession) {
      cachedSession.lastActivityAt = now;
      await this.cacheManager.set(cacheKey, cachedSession, this.cacheTTL);
    }
  }

  async getUserSessions(userId: number, currentSessionId?: number): Promise<SessionResponse[]> {
    const now = new Date();
    const sessions = await this.userSessionRepository
      .createQueryBuilder("session")
      .where("session.userId = :userId", { userId })
      .andWhere("session.revokedAt IS NULL")
      .andWhere("(session.expiresAt IS NULL OR session.expiresAt > :now)", { now })
      .orderBy("session.lastActivityAt", "DESC", "NULLS LAST")
      .addOrderBy("session.createdAt", "DESC")
      .getMany();

    return sessions.map((s) => this.mapToSessionResponse(s, currentSessionId));
  }

  async getCurrentSession(userId: number, currentSessionId: number): Promise<SessionResponse> {
    const session = await this.userSessionRepository.findOne({
      where: { id: currentSessionId, userId },
    });
    if (!session) throw new NotFoundException("Session not found");
    await this.validate(session);
    return this.mapToSessionResponse(session, currentSessionId);
  }

  async revokeSession(sessionId: number, userId?: number): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: userId !== undefined ? { id: sessionId, userId } : { id: sessionId },
    });
    if (!session) throw new NotFoundException("Session not found");
    if (!session.revokedAt) {
      session.revokedAt = new Date();
      await this.userSessionRepository.save(session);
    }
    await this.cacheManager.del(`session:${sessionId}`);
  }

  async revokeOtherSessions(userId: number, currentSessionId: number): Promise<{ revokedCount: number }> {
    const sessions = await this.userSessionRepository
      .createQueryBuilder("session")
      .where("session.userId = :userId", { userId })
      .andWhere("session.id != :currentSessionId", { currentSessionId })
      .andWhere("session.revokedAt IS NULL")
      .getMany();

    if (sessions.length === 0) {
      return { revokedCount: 0 };
    }

    const now = new Date();
    const sessionIds = sessions.map((s) => s.id);

    await this.userSessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: now })
      .where("id IN (:...ids)", { ids: sessionIds })
      .execute();

    await Promise.all(sessionIds.map((id) => this.cacheManager.del(`session:${id}`)));

    return { revokedCount: sessions.length };
  }

  async revokeAllSessions(userId: number): Promise<{ revokedCount: number }> {
    const sessions = await this.userSessionRepository
      .createQueryBuilder("session")
      .where("session.userId = :userId", { userId })
      .andWhere("session.revokedAt IS NULL")
      .getMany();

    if (sessions.length === 0) {
      return { revokedCount: 0 };
    }

    const now = new Date();
    const sessionIds = sessions.map((s) => s.id);

    await this.userSessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: now })
      .where("id IN (:...ids)", { ids: sessionIds })
      .execute();

    await Promise.all(sessionIds.map((id) => this.cacheManager.del(`session:${id}`)));

    return { revokedCount: sessions.length };
  }

  private async enforceActiveSessionLimit(userId: number, maxSessions: number = this.maxActiveSessions): Promise<void> {
    const now = new Date();
    const activeSessions = await this.userSessionRepository
      .createQueryBuilder("session")
      .where("session.userId = :userId", { userId })
      .andWhere("session.revokedAt IS NULL")
      .andWhere("(session.expiresAt IS NULL OR session.expiresAt > :now)", { now })
      .orderBy("session.lastActivityAt", "ASC", "NULLS FIRST")
      .addOrderBy("session.createdAt", "ASC")
      .getMany();

    if (activeSessions.length >= maxSessions) {
      const sessionsToRevokeCount = activeSessions.length - maxSessions + 1;
      const sessionsToRevoke = activeSessions.slice(0, sessionsToRevokeCount);
      const sessionIds = sessionsToRevoke.map((s) => s.id);

      await this.userSessionRepository
        .createQueryBuilder()
        .update(UserSession)
        .set({ revokedAt: now })
        .where("id IN (:...ids)", { ids: sessionIds })
        .execute();

      await Promise.all(sessionIds.map((id) => this.cacheManager.del(`session:${id}`)));
    }
  }

  private async updateActivityThrottled(session: UserSession): Promise<void> {
    const now = Date.now();
    const lastActivityTime = session.lastActivityAt ? new Date(session.lastActivityAt).getTime() : 0;
    const fiveMinutes = 5 * 60 * 1000;
    if (now - lastActivityTime > fiveMinutes) {
      const newActivityAt = new Date();
      session.lastActivityAt = newActivityAt;
      await this.userSessionRepository.update(session.id, { lastActivityAt: newActivityAt });
      await this.cacheManager.set(`session:${session.id}`, session, this.cacheTTL);
    }
  }

  private mapToSessionResponse(session: UserSession, currentSessionId?: number): SessionResponse {
    return {
      id: Number(session.id),
      userId: Number(session.userId),
      isCurrent: currentSessionId !== undefined ? Number(session.id) === Number(currentSessionId) : false,
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
      browser: parseBrowser(session.userAgent),
      platform: parsePlatform(session.userAgent),
      deviceId: session.deviceId ? String(session.deviceId) : null,
      lastActivityAt: session.lastActivityAt ?? null,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt ?? null,
    };
  }
}
