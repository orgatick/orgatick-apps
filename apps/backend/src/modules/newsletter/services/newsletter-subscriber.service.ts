import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  buildNewsletterSubscriberStats,
  NewsletterSubscriberStatus,
  toNewsletterSubscriberResponse,
  type BulkSubscriberActionDto,
  type CreateNewsletterListDto,
  type ManageSubscriptionResponse,
  type NewsletterListResponse,
  type NewsletterSubscriberQueryDto,
  type NewsletterSubscriberResponse,
  type NewsletterSubscriberStats,
  type SubscribeNewsletterDto,
  type SubscribeNewsletterResponse,
  type UnsubscribeNewsletterResponse,
  type UpdateNewsletterListDto,
  type UpdateNewsletterPreferencesDto,
  type UpdateSubscriberStatusDto,
} from "@orgatick/contracts";
import { NewsletterList } from "../entities/newsletter-list.entity";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterListService } from "./newsletter-list.service";
import { NewsletterMailerService } from "./newsletter-mailer.service";
import { NewsletterSubscriptionLifecycleService } from "./newsletter-subscription-lifecycle.service";
import { NewsletterTokenService } from "./newsletter-token.service";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";
import { executeBulkSubscriberAction, generateSubscribersCsv } from "../utils/newsletter-subscriber-batch";
import { buildNewSubscriber, normalizeEmail, reopenSubscriber } from "../utils/newsletter-subscriber-factory";
import type { NewsletterRequestContext } from "../types/newsletter.types";

@Injectable()
export class NewsletterSubscriberService {
  private readonly logger = new Logger(NewsletterSubscriberService.name);
  private readonly doubleOptIn: boolean;
  private readonly enabled: boolean;
  private readonly confirmationTtlMinutes: number;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly listService: NewsletterListService,
    private readonly lifecycleService: NewsletterSubscriptionLifecycleService,
    private readonly tokenService: NewsletterTokenService,
    private readonly mailer: NewsletterMailerService,
    configService: ConfigService,
  ) {
    this.enabled = configService.get<string>("NEWSLETTER_ENABLED") === "true";
    this.doubleOptIn = configService.get<string>("NEWSLETTER_DOUBLE_OPT_IN") === "true";
    this.confirmationTtlMinutes = configService.getOrThrow<number>("NEWSLETTER_CONFIRMATION_TTL_MINUTES");
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  async subscribe(
    dto: SubscribeNewsletterDto,
    context: NewsletterRequestContext,
  ): Promise<SubscribeNewsletterResponse> {
    if (!this.enabled) throw new ServiceUnavailableException("Newsletter subscriptions are currently unavailable");
    if (dto.website) {
      return {
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        email: dto.email,
        message: "Almost done - check your inbox.",
        alreadySubscribed: false,
      };
    }

    const list = await this.listService.resolveList(dto.list);
    const emailNormalized = normalizeEmail(dto.email);
    const existing = await this.subscriberRepository.findByListAndEmail(list.id, emailNormalized);

    if (existing && existing.status === NewsletterSubscriberStatus.SUBSCRIBED) {
      return {
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        email: existing.email,
        message: "You are already subscribed to this list.",
        alreadySubscribed: true,
      };
    }

    const subscriber = existing
      ? reopenSubscriber(existing, dto, context)
      : buildNewSubscriber(
          list,
          dto,
          emailNormalized,
          context,
          this.tokenService.hashToken(this.tokenService.createOpaqueToken()),
        );
    const saved = await this.subscriberRepository.save(subscriber);
    const token = this.tokenService.createConfirmationToken(saved.uuid, this.confirmationTtlMinutes);
    saved.confirmationTokenHash = this.tokenService.hashToken(token);
    saved.confirmationExpiresAt = new Date(Date.now() + this.confirmationTtlMinutes * 60_000);
    await this.subscriberRepository.save(saved);

    if (!this.doubleOptIn) {
      return await this.lifecycleService.confirmInternal(saved, false);
    }

    await this.mailer.sendConfirmationEmail({
      email: saved.email,
      name: saved.name,
      listName: list.name,
      confirmUrl: `${this.publicBaseUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`,
    });

    return {
      status: NewsletterSubscriberStatus.PENDING,
      email: saved.email,
      message: "Almost done - check your inbox to confirm.",
      alreadySubscribed: false,
    };
  }

  confirm(token: string): Promise<SubscribeNewsletterResponse> {
    return this.lifecycleService.confirm(token);
  }
  unsubscribe(token: string): Promise<UnsubscribeNewsletterResponse> {
    return this.lifecycleService.unsubscribe(token);
  }
  getSubscription(token: string): Promise<ManageSubscriptionResponse> {
    return this.lifecycleService.getSubscription(token);
  }
  updatePreferences(token: string, dto: UpdateNewsletterPreferencesDto): Promise<ManageSubscriptionResponse> {
    return this.lifecycleService.updatePreferences(token, dto);
  }
  resubscribe(token: string): Promise<SubscribeNewsletterResponse> {
    return this.lifecycleService.resubscribe(token);
  }

  findLists(): Promise<NewsletterListResponse[]> {
    return this.listService.findLists();
  }
  createList(dto: CreateNewsletterListDto): Promise<NewsletterListResponse> {
    return this.listService.createList(dto);
  }
  updateList(id: bigint, dto: UpdateNewsletterListDto): Promise<NewsletterListResponse> {
    return this.listService.updateList(id, dto);
  }
  requireList(id: bigint): Promise<NewsletterList> {
    return this.listService.requireList(id);
  }
  requireDefaultList(): Promise<NewsletterList> {
    return this.listService.requireDefaultList();
  }

  async findAll(query: NewsletterSubscriberQueryDto): Promise<{
    items: NewsletterSubscriberResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [subscribers, total] = await this.subscriberRepository.findPaginated(query);
    return {
      items: subscribers.map((s) => toNewsletterSubscriberResponse(s)),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async stats(listId?: string): Promise<NewsletterSubscriberStats> {
    const counts = await this.subscriberRepository.countByStatus(listId ? BigInt(listId) : undefined);
    return buildNewsletterSubscriberStats({
      total: Object.values(counts).reduce((sum, v) => sum + v, 0),
      pending: counts[NewsletterSubscriberStatus.PENDING],
      subscribed: counts[NewsletterSubscriberStatus.SUBSCRIBED],
      unsubscribed: counts[NewsletterSubscriberStatus.UNSUBSCRIBED],
      bounced: counts[NewsletterSubscriberStatus.BOUNCED],
      complained: counts[NewsletterSubscriberStatus.COMPLAINED],
    });
  }

  async findOne(id: bigint): Promise<NewsletterSubscriberResponse> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) throw new NotFoundException("Subscriber not found");
    return toNewsletterSubscriberResponse(subscriber);
  }

  async updateStatus(id: bigint, dto: UpdateSubscriberStatusDto): Promise<NewsletterSubscriberResponse> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) throw new NotFoundException("Subscriber not found");
    subscriber.status = dto.status;
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;
    if (dto.status === NewsletterSubscriberStatus.SUBSCRIBED) {
      subscriber.subscribedAt = subscriber.subscribedAt ?? new Date();
      subscriber.confirmedAt = subscriber.confirmedAt ?? new Date();
      subscriber.unsubscribedAt = null;
    } else {
      subscriber.confirmedAt = null;
    }
    if (dto.status === NewsletterSubscriberStatus.UNSUBSCRIBED) subscriber.unsubscribedAt = new Date();
    await this.subscriberRepository.save(subscriber);
    return toNewsletterSubscriberResponse(subscriber);
  }

  async remove(id: bigint): Promise<void> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) throw new NotFoundException("Subscriber not found");
    subscriber.status = NewsletterSubscriberStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    await this.subscriberRepository.save(subscriber);
  }

  bulkAction(dto: BulkSubscriberActionDto): Promise<{ modified: number }> {
    return executeBulkSubscriberAction(this.subscriberRepository, dto);
  }

  exportCsv(listId?: string): Promise<string> {
    return generateSubscribersCsv(this.subscriberRepository, listId);
  }

  async suppressAddress(email: string, status: NewsletterSubscriberStatus): Promise<void> {
    await this.subscriberRepository.suppress(normalizeEmail(email), status);
    this.logger.warn(`Suppressed ${normalizeEmail(email)} after ${status}`);
  }

  async isSubscribed(email: string): Promise<boolean> {
    const subscriber = await this.subscriberRepository.findByEmail(normalizeEmail(email));
    return subscriber?.status === NewsletterSubscriberStatus.SUBSCRIBED;
  }
}

export { normalizeEmail } from "../utils/newsletter-subscriber-factory";
