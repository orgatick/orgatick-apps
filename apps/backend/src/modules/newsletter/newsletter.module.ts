import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAdminGuard } from "../../common/authorization/guards/platform-admin.guard";
import { MailModule } from "../../infrastructure/mail/mail.module";
import { QueueModule } from "../../infrastructure/queue/queue.module";
import { AdminNewsletterController } from "./controllers/admin-newsletter.controller";
import { AdminNewsletterListController } from "./controllers/admin-newsletter-list.controller";
import { AdminNewsletterSubscriberController } from "./controllers/admin-newsletter-subscriber.controller";
import { AdminNewsletterTemplateController } from "./controllers/admin-newsletter-template.controller";
import { NewsletterAuthController } from "./controllers/newsletter-auth.controller";
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
import { NewsletterRecipientStatsRepository } from "./repositories/newsletter-recipient-stats.repository";
import { NewsletterRepository } from "./repositories/newsletter.repository";
import { NewsletterSubscriberRepository } from "./repositories/newsletter-subscriber.repository";
import { NewsletterTemplateRepository } from "./repositories/newsletter-template.repository";
import { NewsletterMailProcessor } from "./processors/newsletter-mail.processor";
import { NewsletterCampaignService } from "./services/newsletter-campaign.service";
import { NewsletterCampaignActionsService } from "./services/newsletter-campaign-actions.service";
import { NewsletterCampaignReportService } from "./services/newsletter-campaign-report.service";
import { NewsletterContentService } from "./services/newsletter-content.service";
import { NewsletterDeliveryService } from "./services/newsletter-delivery.service";
import { NewsletterDispatchService } from "./services/newsletter-dispatch.service";
import { NewsletterListService } from "./services/newsletter-list.service";
import { NewsletterMailerService } from "./services/newsletter-mailer.service";
import { NewsletterRenderService } from "./services/newsletter-render.service";
import { NewsletterSchedulerService } from "./services/newsletter-scheduler.service";
import { NewsletterSubscriberService } from "./services/newsletter-subscriber.service";
import { NewsletterSubscriptionLifecycleService } from "./services/newsletter-subscription-lifecycle.service";
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
  imports: [TypeOrmModule.forFeature(ENTITIES), MailModule, QueueModule],
  controllers: [
    AdminNewsletterController,
    AdminNewsletterListController,
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
    NewsletterRecipientStatsRepository,
    NewsletterEventRepository,
    // Services
    NewsletterTokenService,
    NewsletterContentService,
    NewsletterRenderService,
    NewsletterMailerService,
    NewsletterListService,
    NewsletterSubscriptionLifecycleService,
    NewsletterSubscriberService,
    NewsletterTemplateService,
    NewsletterCampaignActionsService,
    NewsletterCampaignReportService,
    NewsletterCampaignService,
    NewsletterDeliveryService,
    NewsletterDispatchService,
    NewsletterTrackingService,
    NewsletterSchedulerService,
    // Mail queue worker
    NewsletterMailProcessor,
  ],
  exports: [
    NewsletterSubscriberService,
    NewsletterSubscriptionLifecycleService,
    NewsletterListService,
    NewsletterCampaignService,
    NewsletterTemplateService,
    NewsletterListRepository,
  ],
})
export class NewsletterModule {}
