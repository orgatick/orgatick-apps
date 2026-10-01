import { type DynamicModule, Global, Module, type Provider } from "@nestjs/common";
import { RedisClientModule } from "../redis/redis.module";
import { RATE_LIMIT_MODULE_OPTIONS } from "./constants/rate-limit.constants";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { RateLimitService } from "./services/rate-limit.service";
import type { RateLimitModuleOptions } from "./types/rate-limit.types";

@Global()
@Module({
  imports: [RedisClientModule],
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard, RedisClientModule],
})
// biome-ignore lint/complexity/noStaticOnlyClass: Standard NestJS dynamic module pattern
export class RateLimitModule {
  static forRoot(options: RateLimitModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: RateLimitModule,
      global: true,
      imports: [RedisClientModule],
      providers: [optionsProvider, RateLimitService, RateLimitGuard],
      exports: [optionsProvider, RateLimitService, RateLimitGuard, RedisClientModule],
    };
  }
}
