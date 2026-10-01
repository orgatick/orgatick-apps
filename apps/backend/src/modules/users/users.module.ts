import { Module } from "@nestjs/common";
import { UsersService } from "./service/users.service";
import { UsersController } from "./controller/users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersMeController } from "./controller/user-me.controller";
import { AdminUsersController } from "./controller/admin-users.controller";
import { UserAdminService } from "./service/user-admin.service";
import { UserAdminRepository } from "./repositories/user-admin.repository";
import { PlatformAdminGuard } from "../../common/authorization/guards/platform-admin.guard";
import { Organization } from "../organization/organization/entities/organization.entity";
import { StorageModule } from "../../infrastructure/storage/storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization]), StorageModule],
  controllers: [UsersController, UsersMeController, AdminUsersController],
  providers: [UsersService, UserAdminService, UserAdminRepository, PlatformAdminGuard],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
