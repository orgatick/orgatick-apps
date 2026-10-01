import { Controller, Get, Param, Delete, Query } from "@nestjs/common";

import { LoginAttemptService } from "../service/login-attempt.service";
import { Request as Req } from "@nestjs/common";

import { UserDeviceService } from "../service/user-device.service";
import type { LoginAttemptQueryDto } from "../dto/login-attempt-query.dto";
import type { AuthRequest } from "@/common/types/auth-request.types";

@Controller("identity")
export class IdentityController {
  constructor(
    private readonly loginAttemptService: LoginAttemptService,
    private readonly userDeviceService: UserDeviceService,
  ) {}

  @Get("login-attempts")
  async getMyLoginAttempts(@Req() req: AuthRequest, @Query() query: LoginAttemptQueryDto) {
    return await this.loginAttemptService.findAttemptsByUserId(req.user.id, query);
  }

  @Get("devices")
  async getMyDevices(@Req() req: AuthRequest) {
    return await this.userDeviceService.getUserDevices(req.user.id);
  }

  @Get("devices/:deviceId")
  async getDeviceById(@Param("deviceId") deviceId: string, @Req() req: AuthRequest) {
    return await this.userDeviceService.getDeviceById(deviceId, req.user.id);
  }

  @Delete("devices/:deviceId")
  async removeDevice(@Param("deviceId") deviceId: string, @Req() req: AuthRequest) {
    await this.userDeviceService.removeDevice(deviceId, req.user.id);
    return "Device removed successfully";
  }
}
