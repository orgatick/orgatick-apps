import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";
import { SkipRateLimit } from "./infrastructure/rate-limit/decorators/rate-limit.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @SkipRateLimit()
  @Get("health")
  async getHealth() {
    return await this.appService.getHealth();
  }
}
