import { Module } from "@nestjs/common";
import { IdentityController } from "./controller/identity.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAccount } from "./entities/user-account.entity";
import { UserBackupCode } from "./entities/user-backup-code.entity";
import { UserDevice } from "./entities/user-device.entity";
import { UserLoginAttempt } from "./entities/user-login-attempt.entity";
import { UserPasskey } from "./entities/user-passkey.entity";
import { UserSecurity } from "./entities/user-security.entity";
import { UserSession } from "./entities/user-session.entity";
import { UserVerification } from "./entities/user-verification.entity";

import { LoginAttemptService } from "./service/login-attempt.service";
import { UserDeviceService } from "./service/user-device.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAccount,
      UserBackupCode,
      UserDevice,
      UserLoginAttempt,
      UserPasskey,
      UserSecurity,
      UserSession,
      UserVerification,
    ]),
  ],
  controllers: [IdentityController],
  providers: [LoginAttemptService, UserDeviceService],
  exports: [TypeOrmModule, LoginAttemptService, UserDeviceService],
})
export class IdentityModule {}
