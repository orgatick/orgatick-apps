import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAdminGuard } from "../../common/authorization/guards/platform-admin.guard";
import { MailModule } from "../../infrastructure/mail/mail.module";
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

const ENTITIES = [
  NewsletterList,
  NewsletterSubscriber,
  NewsletterTemplate,
  Newsletter,
  NewsletterRecipient,
  NewsletterEvent,
];

@Module({
  // MailModule is global, but importing it keeps the mail dependency explicit.
  imports: [TypeOrmModule.forFeature(ENTITIES), MailModule],
  controllers: [
    AdminNewsletterController,
    AdminNewsletterSubscriberController,
    AdminNewsletterTemplateController,
    NewsletterPublicController,
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
  ],
  exports: [
    NewsletterSubscriberService,
    NewsletterCampaignService,
    NewsletterTemplateService,
    NewsletterListRepository,
  ],
})
export class NewsletterModule {}
