import { z } from "zod";
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().min(1),
  REDIS_URL: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),

  /** Canonical public origin of the web app. Every link in an email is built from it. */
  APP_URL: z.string().min(1),
  COOKIE_DOMAIN: z.string().min(1),

  ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS: z.coerce.number().int().positive().default(300000),

  NEWSLETTER_ENABLED: z.enum(["true", "false"]).default("true"),
  NEWSLETTER_DOUBLE_OPT_IN: z.enum(["true", "false"]).default("true"),
  NEWSLETTER_TRACKING_ENABLED: z.enum(["true", "false"]).default("true"),
  NEWSLETTER_FROM_NAME: z.string().min(1).default("Orgatick Newsletter"),
  NEWSLETTER_FROM_EMAIL: z.email().default("newsletter@orgatick.in"),
  NEWSLETTER_REPLY_TO: z.email().optional(),
  /** Optional override when newsletter pages are served from another host. Defaults to APP_URL. */
  NEWSLETTER_PUBLIC_BASE_URL: z.url().optional(),
  /** Signs confirm/unsubscribe/preferences tokens. Falls back to JWT_SECRET when unset. */
  NEWSLETTER_TOKEN_SECRET: z.string().min(32).optional(),
  NEWSLETTER_CONFIRMATION_TTL_MINUTES: z.coerce.number().int().min(5).max(10080).default(2880),
  /** Campaign dispatch tick interval. Multiple replicas contend on a Redis lock. */
  NEWSLETTER_DISPATCH_INTERVAL_MS: z.coerce.number().int().min(5000).max(600000).default(15000),
  NEWSLETTER_BATCH_SIZE: z.coerce.number().int().min(1).max(1000).default(100),
  NEWSLETTER_MAX_RECIPIENTS_PER_SEND: z.coerce.number().int().min(1).max(500000).default(100000),
  /** Svix-style webhook secret used to verify deliverability callbacks. */
  NEWSLETTER_WEBHOOK_SECRET: z.string().min(16).optional(),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_ENDPOINT: z.string().min(1),
  R2_PUBLIC_BUCKET: z.string().min(1),
  R2_PRIVATE_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().min(1),

  GITHUB_TOKEN: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  OBSERVE_APP_KEY: z.string().min(1),
  OBSERVE_APP_SECRET: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
