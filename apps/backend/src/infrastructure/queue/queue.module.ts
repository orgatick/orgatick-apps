import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import type { ConnectionOptions } from "bullmq";
import { MAIL_QUEUE_CONFIG } from "../../config/mail-queue.config";
import { MailQueueService } from "./mail-queue.service";
import { MAIL_QUEUE } from "./queue.constants";

/**
 * Builds the BullMQ connection from the Redis settings already used by the cache.
 *
 * BullMQ needs a real TCP connection and its own blocking commands, so the queue points at the
 * same local instance as the cache. That instance must run with `maxmemory-policy noeviction`:
 * an evicting Redis can drop a queued job, which the campaign reconciler then has to notice
 * and repair.
 */
function buildConnection(config: ConfigService): ConnectionOptions {
  return {
    host: config.get<string>("REDIS_HOST") || "127.0.0.1",
    port: Number(config.get<string>("REDIS_PORT") || 6379),
    password: config.get<string>("REDIS_PASSWORD") || undefined,
    db: config.get<number>("REDIS_DB") ?? 0,
  };
}

/**
 * Registers the queue connection once for the whole app and exposes the mail queue.
 *
 * Global because any module may produce mail; only the module that owns delivery registers
 * a `@Processor` for it.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: buildConnection(config),
        prefix: MAIL_QUEUE_CONFIG.queuePrefix,
      }),
    }),
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  providers: [MailQueueService],
  exports: [BullModule, MailQueueService],
})
export class QueueModule {}
