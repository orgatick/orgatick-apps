import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import { UserAdminService } from "../service/user-admin.service";
import {
  AdminUserQuerySchema,
  UpdateUserRoleSchema,
  type AdminUserQueryDto,
  type UpdateUserRoleDto,
} from "../dto/user-admin.dto";

@UseGuards(PlatformAdminGuard)
@Controller("admin")
export class AdminUsersController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Get("users")
  async findAllUsers(@Query({ schema: AdminUserQuerySchema }) query: AdminUserQueryDto) {
    return await this.userAdminService.findAllUsers(query);
  }

  @Get("users/:id")
  async findUser(@Param("id") id: string) {
    return await this.userAdminService.findUser(BigInt(id));
  }

  @Patch("users/:id/role")
  async updateUserRole(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: UpdateUserRoleSchema }) dto: UpdateUserRoleDto,
  ) {
    return await this.userAdminService.updateUserRole(BigInt(id), dto.role, BigInt(req.user.id));
  }
}
