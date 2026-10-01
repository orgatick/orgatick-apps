import { Global, Logger, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { type RedisOptions } from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger("RedisClient");
        const redisUrl = config.get<string>("REDIS_URL");

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

        let client: Redis;
        if (redisUrl) {
          client = new Redis(redisUrl, commonOptions);
        } else {
          const host = config.get<string>("REDIS_HOST") || "127.0.0.1";
          const port = config.get<number>("REDIS_PORT") || 6379;
          const password = config.get<string>("REDIS_PASSWORD") || undefined;

          client = new Redis({
            host,
            port,
            password,
            ...commonOptions,
          });
        }

        client.on("connect", () => {
          logger.log("Redis client connected successfully");
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

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown signal received (${signal}), closing Redis connections...`);
  }
}
