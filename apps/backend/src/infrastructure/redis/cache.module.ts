import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import Keyv from "keyv";
import { resolveRedisConfig } from "./redis.config";

export const cacheModule = CacheModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const redis = resolveRedisConfig(config);

    const socket = redis.isTls
      ? {
          host: redis.host,
          port: redis.port,
          tls: true as const,
          servername: redis.tls?.servername ?? redis.host,
          rejectUnauthorized: redis.tls?.rejectUnauthorized,
        }
      : {
          host: redis.host,
          port: redis.port,
        };

    return {
      stores: [
        new Keyv({
          store: new KeyvRedis({
            socket,
            username: redis.username,
            password: redis.password,
            database: redis.db,
          }),
        }),
      ],
    };
  },
});
