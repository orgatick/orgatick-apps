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
        store: new KeyvRedis(config.getOrThrow<string>("REDIS_URL")),
      }),
    ],
  }),
});
