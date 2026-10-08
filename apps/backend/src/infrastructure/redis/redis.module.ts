import { Global, Inject, Logger, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { type RedisOptions } from "ioredis";
import { resolveRedisConfig } from "./redis.config";
import { REDIS_CLIENT } from "./redis.constants";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger("RedisClient");
        const redisConfig = resolveRedisConfig(config);

        const commonOptions: RedisOptions = {
          lazyConnect: false,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 100, 3000);
            logger.warn(`Redis reconnecting, attempt #${times}, delaying by ${delay}ms`);
            return delay;
          },
          reconnectOnError: (err: Error) => {
            logger.error(`Redis reconnectOnError: ${err.message}`);
            return true;
          },
        };

        const client = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          username: redisConfig.username,
          db: redisConfig.db,
          tls: redisConfig.tls,
          ...commonOptions,
        });

        client.on("connect", () => {
          logger.log(
            `Redis client connected successfully to ${redisConfig.host}:${redisConfig.port} (TLS: ${redisConfig.isTls})`,
          );
        });

        client.on("error", (err: Error) => {
          logger.error(`Redis client error: ${err.message}`);
        });

        client.on("close", () => {
          logger.warn("Redis client connection closed");
        });

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisClientModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisClientModule.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown signal received (${signal}), closing Redis connections...`);
    try {
      await this.redisClient.quit();
    } catch {
      // Ignore errors on shutdown
    }
  }
}
