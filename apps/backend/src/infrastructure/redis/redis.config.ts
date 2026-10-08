import type { ConfigService } from "@nestjs/config";

export interface ResolvedRedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  isTls: boolean;
  tls?: {
    servername: string;
    rejectUnauthorized?: boolean;
  };
}

/**
 * Resolves Redis connection options from ConfigService or process.env.
 *
 * Normalizes host strings (stripping protocols like rediss:// or redis://),
 * supports full REDIS_URL connection strings (standard for hosted Redis such as Upstash),
 * and automatically enables TLS when rediss://, *.upstash.io, or REDIS_TLS is detected.
 */
export function resolveRedisConfig(config: ConfigService): ResolvedRedisConfig {
  const redisUrl = config.get<string>("REDIS_URL")?.trim();
  const rawHost = (config.get<string>("REDIS_HOST") || "127.0.0.1").trim();
  const rawPort = config.get<number>("REDIS_PORT");
  const rawPassword = config.get<string>("REDIS_PASSWORD")?.trim();
  const rawUsername = config.get<string>("REDIS_USERNAME")?.trim();
  const rawDb = config.get<number>("REDIS_DB");
  const rawTls = config.get<boolean | string>("REDIS_TLS");
  const rawRejectUnauthorized = config.get<boolean | string>("REDIS_TLS_REJECT_UNAUTHORIZED");

  let host = "127.0.0.1";
  let port = Number(rawPort || 6379);
  let username = rawUsername || undefined;
  let password = rawPassword || undefined;
  let db = typeof rawDb === "number" ? rawDb : 0;
  let isTls = false;

  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      isTls = parsed.protocol === "rediss:";
      host = parsed.hostname;
      if (parsed.port) {
        port = Number(parsed.port);
      }
      if (parsed.username) {
        username = decodeURIComponent(parsed.username);
      }
      if (parsed.password) {
        password = decodeURIComponent(parsed.password);
      }
      if (parsed.pathname && parsed.pathname.length > 1) {
        const parsedDb = Number(parsed.pathname.slice(1));
        if (!Number.isNaN(parsedDb)) {
          db = parsedDb;
        }
      }
    } catch {
      // If URL parsing fails, fall back to host-based config
      host = rawHost;
    }
  } else if (rawHost.includes("://")) {
    try {
      const parsed = new URL(rawHost);
      isTls = parsed.protocol === "rediss:" || parsed.protocol === "https:";
      host = parsed.hostname;
      if (parsed.port) {
        port = Number(parsed.port);
      } else if (rawPort) {
        port = Number(rawPort);
      } else {
        port = 6379;
      }
      if (parsed.username) {
        username = decodeURIComponent(parsed.username);
      }
      if (parsed.password) {
        password = decodeURIComponent(parsed.password);
      }
      if (parsed.pathname && parsed.pathname.length > 1) {
        const parsedDb = Number(parsed.pathname.slice(1));
        if (!Number.isNaN(parsedDb)) {
          db = parsedDb;
        }
      }
    } catch {
      isTls = rawHost.startsWith("rediss://") || rawHost.startsWith("https://");
      host = rawHost
        .replace(/^[a-zA-Z]+:\/\//, "")
        .split("/")[0]
        .split(":")[0];
    }
  } else {
    // Plain host, check if port is in the string (e.g., host:port)
    if (rawHost.includes(":") && !rawHost.includes("]")) {
      const [h, p] = rawHost.split(":");
      host = h;
      if (p) {
        port = Number(p);
      }
    } else {
      host = rawHost;
    }
  }

  // Detect TLS requirements
  if (rawTls === true || rawTls === "true" || rawTls === "1" || host.endsWith("upstash.io")) {
    isTls = true;
  } else if (rawTls === false || rawTls === "false" || rawTls === "0") {
    isTls = false;
  }

  const rejectUnauthorized = !(
    rawRejectUnauthorized === false ||
    rawRejectUnauthorized === "false" ||
    rawRejectUnauthorized === "0"
  );

  const tls = isTls
    ? {
        servername: host,
        rejectUnauthorized,
      }
    : undefined;

  return {
    host,
    port,
    username,
    password,
    db,
    isTls,
    tls,
  };
}
