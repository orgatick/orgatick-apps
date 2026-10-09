import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthenticationController } from "./controllers/authentication.controller";
import { PasswordController } from "./controllers/password.controller";
import { SessionController } from "./controllers/session.controller";
import { AuthenticationService } from "./services/authentication.service";
import { CookieService } from "./services/cookies.service";
import { EmailVerificationService } from "./services/email-verification.service";
import { GoogleOAuthService } from "./services/oauth-google.service";
import { PasswordService } from "./services/password.service";
import { SessionService } from "./services/session.service";
import { TokenRefreshService } from "./services/token-refresh.service";
import { TokenService } from "./services/token.service";
import { UserLoginService } from "./services/user-login.service";
import { UserLogoutService } from "./services/user-logout.service";
import { UserRegistrationService } from "./services/user-registration.service";
import { OAuthService } from "./services/oauth.service";
import { MailModule } from "@/infrastructure/mail/mail.module";
import { IdentityModule } from "../identity/identity.module";
import { UsersModule } from "../users/users.module";

import { AuthThrottleService } from "./services/auth-throttle.service";
import { SessionCleanupService } from "./services/session-cleanup.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
      }),
    }),
    IdentityModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AuthenticationController, PasswordController, SessionController],
  providers: [
    AuthenticationService,
    PasswordService,
    CookieService,
    TokenService,
    SessionService,
    UserRegistrationService,
    UserLoginService,
    EmailVerificationService,
    TokenRefreshService,
    UserLogoutService,
    OAuthService,
    GoogleOAuthService,
    AuthThrottleService,
    SessionCleanupService,
  ],
  exports: [
    AuthenticationService,
    SessionService,
    CookieService,
    TokenService,
    GoogleOAuthService,
    PasswordService,
    AuthThrottleService,
    SessionCleanupService,
  ],
})
export class AuthenticationModule {}
