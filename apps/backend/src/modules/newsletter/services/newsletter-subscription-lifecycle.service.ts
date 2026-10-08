import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NewsletterSubscriberStatus,
  type ManageSubscriptionResponse,
  type SubscribeNewsletterResponse,
  type UnsubscribeNewsletterResponse,
  type UpdateNewsletterPreferencesDto,
} from "@orgatick/contracts";
import { NewsletterSubscriber } from "../entities/newsletter-subscriber.entity";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterMailerService } from "./newsletter-mailer.service";
import { NewsletterTokenService } from "./newsletter-token.service";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

@Injectable()
export class NewsletterSubscriptionLifecycleService {
  private readonly publicBaseUrl: string;

  constructor(
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly tokenService: NewsletterTokenService,
    private readonly mailer: NewsletterMailerService,
    configService: ConfigService,
  ) {
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  async confirm(token: string): Promise<SubscribeNewsletterResponse> {
    const payload = this.tokenService.verifyToken(token, "confirm");
    const subscriber = await this.subscriberRepository.findByUuid(payload.subscriberUuid);
    if (!subscriber) {
      throw new NotFoundException("This confirmation link is no longer valid");
    }

    if (subscriber.status === NewsletterSubscriberStatus.SUBSCRIBED) {
      return {
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        email: subscriber.email,
        message: "Your subscription is already confirmed.",
        alreadySubscribed: true,
      };
    }

    if (subscriber.confirmationExpiresAt && subscriber.confirmationExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException("This confirmation link has expired. Please subscribe again.");
    }

    return await this.confirmInternal(subscriber, true);
  }

  async unsubscribe(token: string): Promise<UnsubscribeNewsletterResponse> {
    const payload = this.tokenService.verifyToken(token, "unsubscribe");
    const subscriber = await this.subscriberRepository.findByUuid(payload.subscriberUuid);
    if (!subscriber) {
      throw new NotFoundException("This subscription link is no longer valid");
    }

    if (subscriber.status === NewsletterSubscriberStatus.UNSUBSCRIBED) {
      return {
        status: NewsletterSubscriberStatus.UNSUBSCRIBED,
        email: subscriber.email,
        message: "You are already unsubscribed.",
        preferences: subscriber.preferences,
      };
    }

    subscriber.status = NewsletterSubscriberStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;
    await this.subscriberRepository.save(subscriber);

    const manageToken = this.tokenService.createManageToken(subscriber.uuid);
    await this.mailer.sendUnsubscribedEmail({
      email: subscriber.email,
      listName: subscriber.list?.name ?? "our newsletter",
      resubscribeUrl: `${this.publicBaseUrl}/newsletter/subscribe?email=${encodeURIComponent(subscriber.email)}`,
      preferencesUrl: `${this.publicBaseUrl}/newsletter/preferences?token=${encodeURIComponent(manageToken)}`,
    });

    return {
      status: NewsletterSubscriberStatus.UNSUBSCRIBED,
      email: subscriber.email,
      message: "You have been unsubscribed.",
      preferences: subscriber.preferences,
    };
  }

  async getSubscription(token: string): Promise<ManageSubscriptionResponse> {
    const payload = this.tokenService.verifyToken(token, "manage");
    const subscriber = await this.requireByUuid(payload.subscriberUuid);

    return {
      email: subscriber.email,
      status: subscriber.status,
      preferences: subscriber.preferences,
      resubscribeToken: await this.rotateManageToken(subscriber),
    };
  }

  async updatePreferences(
    token: string,
    preferences: UpdateNewsletterPreferencesDto,
  ): Promise<ManageSubscriptionResponse> {
    const payload = this.tokenService.verifyToken(token, "manage");
    const subscriber = await this.requireByUuid(payload.subscriberUuid);

    subscriber.preferences = {
      categories: preferences.categories ?? subscriber.preferences?.categories ?? [],
      marketing: preferences.marketing ?? subscriber.preferences?.marketing ?? true,
    };

    await this.subscriberRepository.save(subscriber);

    return {
      email: subscriber.email,
      status: subscriber.status,
      preferences: subscriber.preferences,
      resubscribeToken: await this.rotateManageToken(subscriber),
    };
  }

  async resubscribe(token: string): Promise<SubscribeNewsletterResponse> {
    const payload = this.tokenService.verifyToken(token, "manage");
    const subscriber = await this.requireByUuid(payload.subscriberUuid);

    if (subscriber.status === NewsletterSubscriberStatus.SUBSCRIBED) {
      return {
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        email: subscriber.email,
        message: "You are already subscribed.",
        alreadySubscribed: true,
      };
    }

    subscriber.status = NewsletterSubscriberStatus.SUBSCRIBED;
    subscriber.confirmedAt = new Date();
    subscriber.subscribedAt = subscriber.subscribedAt ?? new Date();
    subscriber.unsubscribedAt = null;
    await this.subscriberRepository.save(subscriber);

    return {
      status: NewsletterSubscriberStatus.SUBSCRIBED,
      email: subscriber.email,
      message: "You have been resubscribed.",
      alreadySubscribed: false,
    };
  }

  async confirmInternal(subscriber: NewsletterSubscriber, sendWelcome: boolean): Promise<SubscribeNewsletterResponse> {
    subscriber.status = NewsletterSubscriberStatus.SUBSCRIBED;
    subscriber.confirmedAt = new Date();
    subscriber.subscribedAt = subscriber.subscribedAt ?? new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;

    const manageToken = this.tokenService.createManageToken(subscriber.uuid);
    subscriber.unsubscribeTokenHash = this.tokenService.hashToken(
      this.tokenService.createUnsubscribeToken(subscriber.uuid),
    );
    await this.subscriberRepository.save(subscriber);

    if (sendWelcome) {
      await this.mailer.sendWelcomeEmail({
        email: subscriber.email,
        name: subscriber.name,
        listName: subscriber.list?.name ?? "our newsletter",
        preferencesUrl: `${this.publicBaseUrl}/newsletter/preferences?token=${encodeURIComponent(manageToken)}`,
      });
    }

    return {
      status: NewsletterSubscriberStatus.SUBSCRIBED,
      email: subscriber.email,
      message: "Your subscription is confirmed.",
      alreadySubscribed: false,
    };
  }

  private async rotateManageToken(subscriber: NewsletterSubscriber): Promise<string> {
    const token = this.tokenService.createManageToken(subscriber.uuid);
    subscriber.unsubscribeTokenHash = this.tokenService.hashToken(token);
    await this.subscriberRepository.save(subscriber);
    return token;
  }

  private async requireByUuid(uuid: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.subscriberRepository.findByUuid(uuid);
    if (!subscriber) {
      throw new NotFoundException("This subscription link is no longer valid");
    }
    return subscriber;
  }
}
