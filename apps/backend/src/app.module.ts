import { ScheduleModule } from "@nestjs/schedule";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { configModule } from "./config/config.module";
import { databaseModule } from "./database/database.module";
import { RateLimitGuard } from "./infrastructure/rate-limit/guards/rate-limit.guard";
import { RateLimitModule } from "./infrastructure/rate-limit/rate-limit.module";
import { cacheModule } from "./infrastructure/redis/cache.module";
import { AddressModule } from "./modules/address/address.module";
import { AuthenticationModule } from "./modules/authentication/authentication.module";
import { AuthenticationGuard } from "./modules/authentication/guards/authentication.guard";
import { IdentityModule } from "./modules/identity/identity.module";
import { NewsletterModule } from "./modules/newsletter/newsletter.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { UsersModule } from "./modules/users/users.module";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    configModule,
    databaseModule,
    cacheModule,
    ScheduleModule.forRoot(),
    RateLimitModule,
    UsersModule,
    IdentityModule,
    AuthenticationModule,
    AddressModule,
    OrganizationModule,
    NewsletterModule,
    ObserveModule.forRootAsync({
      imports: [configModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.getOrThrow<string>("OBSERVE_APP_KEY"),
        appSecret: configService.getOrThrow<string>("OBSERVE_APP_SECRET"),
        serviceId: "orgatick-backend",
        runtimeMetrics: true,
        runtimeMetricsInterval: 30000,
      }),
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
