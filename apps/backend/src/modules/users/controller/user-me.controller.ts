import { Body, Controller, Get, Put, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UsersService } from "../service/users.service";
import type { UpdateUserDto } from "../dto/update-user.dto";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { SkipRateLimit } from "../../../infrastructure/rate-limit";
import { UpdateUserRequestSchema } from "@orgatick/contracts";

@Controller("users/me")
export class UsersMeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @SkipRateLimit()
  async getMe(@Req() req: AuthRequest) {
    return req.user;
  }

  @Put()
  @UseInterceptors(FileInterceptor("avatar", { storage: memoryStorage(), limits: { fileSize: 1024 * 1024 * 5 } }))
  async updateMe(
    @Req() req: AuthRequest,
    @Body({ schema: UpdateUserRequestSchema }) updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.update(req.user, updateUserDto, file);
  }
}
