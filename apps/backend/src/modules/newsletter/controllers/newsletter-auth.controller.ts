import { Controller, Get, Req } from "@nestjs/common";
import { NewsletterSubscriberService } from "../services/newsletter-subscriber.service";
import type { AuthRequest } from "@/common/types/auth-request.types";

@Controller("newsletter")
export class NewsletterAuthController {
  constructor(private readonly subscriberService: NewsletterSubscriberService) {}

  @Get("is-subscribed")
  async subscribe(@Req() request: AuthRequest) {
    const isSubscribed = await this.subscriberService.isSubscribed(request.user.email);
    return { isSubscribed };
  }
}
