import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { DataSource } from "typeorm";

export interface DatabaseActivityMetrics {
  status: "up" | "down";
  latencyMs?: number;
  lastActiveAt?: string;
  totalConnections?: number;
  activeConnections?: number;
  idleConnections?: number;
  idleInTransaction?: number;
  maxInactivitySeconds?: number;
  details?: string;
}

@Injectable()
export class AppService {
  private lastDbActiveTimestamp: Date | null = null;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  getHello(): string {
    return "Hello World from dev 40!";
  }

  async getHealth() {
    const dbMetrics: DatabaseActivityMetrics = {
      status: "up",
    };
    let redisStatus = "up";
    let redisLatencyMs = 0;

    // 1. Database Health & Activity/Inactivity Monitoring
    const dbStartTime = Date.now();
    try {
      if (!this.dataSource.isInitialized) {
        dbMetrics.status = "down";
        dbMetrics.details = "DataSource is not initialized";
      } else {
        // Query pg_stat_activity to monitor active vs idle connections and inactivity duration
        const [activityStats]: Array<{
          total_connections?: number;
          active_connections?: number;
          idle_connections?: number;
          idle_in_transaction?: number;
          max_inactivity_seconds?: number | string | null;
        }> = await this.dataSource.query(`
					SELECT
						count(*)::int AS total_connections,
						count(*) FILTER (WHERE state = 'active')::int AS active_connections,
						count(*) FILTER (WHERE state = 'idle')::int AS idle_connections,
						count(*) FILTER (WHERE state = 'idle in transaction' OR state = 'idle in transaction (aborted)')::int AS idle_in_transaction,
						COALESCE(EXTRACT(EPOCH FROM max(now() - state_change)), 0)::float AS max_inactivity_seconds
					FROM pg_stat_activity
					WHERE datname = current_database();
				`);

        const dbLatency = Date.now() - dbStartTime;
        this.lastDbActiveTimestamp = new Date();

        dbMetrics.status = "up";
        dbMetrics.latencyMs = dbLatency;
        dbMetrics.lastActiveAt = this.lastDbActiveTimestamp.toISOString();
        dbMetrics.totalConnections = activityStats?.total_connections ?? 1;
        dbMetrics.activeConnections = activityStats?.active_connections ?? 1;
        dbMetrics.idleConnections = activityStats?.idle_connections ?? 0;
        dbMetrics.idleInTransaction = activityStats?.idle_in_transaction ?? 0;
        dbMetrics.maxInactivitySeconds = activityStats?.max_inactivity_seconds
          ? Number(Number(activityStats.max_inactivity_seconds).toFixed(2))
          : 0;
      }
    } catch (error) {
      // Fallback ping if pg_stat_activity has restricted permissions
      try {
        await this.dataSource.query("SELECT 1");
        const dbLatency = Date.now() - dbStartTime;
        this.lastDbActiveTimestamp = new Date();

        dbMetrics.status = "up";
        dbMetrics.latencyMs = dbLatency;
        dbMetrics.lastActiveAt = this.lastDbActiveTimestamp.toISOString();
      } catch (fallbackError) {
        dbMetrics.status = "down";
        dbMetrics.details = (fallbackError as Error)?.message || (error as Error)?.message;
      }
    }

    // 2. Redis Health Monitoring
    const redisStartTime = Date.now();
    try {
      await this.cacheManager.set("__health_check__", "ok", 5000);
      const cached = await this.cacheManager.get<string>("__health_check__");
      redisLatencyMs = Date.now() - redisStartTime;

      if (cached !== "ok") {
        redisStatus = "down";
      }
    } catch {
      redisStatus = "down";
    }

    const isHealthy = dbMetrics.status === "up" && redisStatus === "up";

    return {
      status: isHealthy ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbMetrics,
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
      },
    };
  }
}
