import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAdminGuard } from "../../common/authorization/guards/platform-admin.guard";
import { MailModule } from "../../infrastructure/mail/mail.module";
import { QueueModule } from "../../infrastructure/queue/queue.module";
import { AdminNewsletterController } from "./controllers/admin-newsletter.controller";
import { AdminNewsletterSubscriberController } from "./controllers/admin-newsletter-subscriber.controller";
import { AdminNewsletterTemplateController } from "./controllers/admin-newsletter-template.controller";
import { NewsletterPublicController } from "./controllers/newsletter-public.controller";
import {
  Newsletter,
  NewsletterEvent,
  NewsletterList,
  NewsletterRecipient,
  NewsletterSubscriber,
  NewsletterTemplate,
} from "./entities/index";
import { NewsletterEventRepository } from "./repositories/newsletter-event.repository";
import { NewsletterListRepository } from "./repositories/newsletter-list.repository";
import { NewsletterRecipientRepository } from "./repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "./repositories/newsletter.repository";
import { NewsletterSubscriberRepository } from "./repositories/newsletter-subscriber.repository";
import { NewsletterTemplateRepository } from "./repositories/newsletter-template.repository";
import { NewsletterMailProcessor } from "./processors/newsletter-mail.processor";
import { NewsletterCampaignService } from "./services/newsletter-campaign.service";
import { NewsletterContentService } from "./services/newsletter-content.service";
import { NewsletterDispatchService } from "./services/newsletter-dispatch.service";
import { NewsletterMailerService } from "./services/newsletter-mailer.service";
import { NewsletterRenderService } from "./services/newsletter-render.service";
import { NewsletterSchedulerService } from "./services/newsletter-scheduler.service";
import { NewsletterSubscriberService } from "./services/newsletter-subscriber.service";
import { NewsletterTemplateService } from "./services/newsletter-template.service";
import { NewsletterTokenService } from "./services/newsletter-token.service";
import { NewsletterTrackingService } from "./services/newsletter-tracking.service";
import { NewsletterAuthController } from "./controllers/newsletter-auth.controller";

const ENTITIES = [
  NewsletterList,
  NewsletterSubscriber,
  NewsletterTemplate,
  Newsletter,
  NewsletterRecipient,
  NewsletterEvent,
];

@Module({
  // Mail and queue modules are global, but importing them keeps the dependencies explicit.
  imports: [TypeOrmModule.forFeature(ENTITIES), MailModule, QueueModule],
  controllers: [
    AdminNewsletterController,
    AdminNewsletterSubscriberController,
    AdminNewsletterTemplateController,
    NewsletterPublicController,
    NewsletterAuthController,
  ],
  providers: [
    PlatformAdminGuard,
    // Repositories
    NewsletterListRepository,
    NewsletterSubscriberRepository,
    NewsletterTemplateRepository,
    NewsletterRepository,
    NewsletterRecipientRepository,
    NewsletterEventRepository,
    // Services
    NewsletterTokenService,
    NewsletterContentService,
    NewsletterRenderService,
    NewsletterMailerService,
    NewsletterSubscriberService,
    NewsletterTemplateService,
    NewsletterCampaignService,
    NewsletterDispatchService,
    NewsletterTrackingService,
    NewsletterSchedulerService,
    // Mail queue worker
    NewsletterMailProcessor,
  ],
  exports: [
    NewsletterSubscriberService,
    NewsletterCampaignService,
    NewsletterTemplateService,
    NewsletterListRepository,
  ],
})
export class NewsletterModule {}
