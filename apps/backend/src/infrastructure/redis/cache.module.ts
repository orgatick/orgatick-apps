import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import Keyv from "keyv";

export const cacheModule = CacheModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    stores: [
      new Keyv({
        // node-redis client options: same host/port settings as the rest of the app.
        store: new KeyvRedis({
          socket: {
            host: config.get<string>("REDIS_HOST") || "127.0.0.1",
            port: Number(config.get<string>("REDIS_PORT") || 6379),
          },
          password: config.get<string>("REDIS_PASSWORD") || undefined,
          database: config.get<number>("REDIS_DB") ?? 0,
        }),
      }),
    ],
  }),
});
