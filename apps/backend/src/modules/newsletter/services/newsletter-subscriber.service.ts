import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  buildNewsletterSubscriberStats,
  NewsletterSubscriberStatus,
  toNewsletterListResponse,
  toNewsletterSubscriberResponse,
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
import { NewsletterSubscriber } from "../entities/newsletter-subscriber.entity";
import { NewsletterListRepository } from "../repositories/newsletter-list.repository";
import { NewsletterSubscriberRepository } from "../repositories/newsletter-subscriber.repository";
import { NewsletterMailerService } from "./newsletter-mailer.service";
import { NewsletterTokenService } from "./newsletter-token.service";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  userId?: bigint | null;
}

/**
 * Owns the subscriber lifecycle: public subscribe (double opt-in), confirmation,
 * self-service unsubscribe / preferences, and the admin subscriber + list views.
 */
@Injectable()
export class NewsletterSubscriberService {
  private readonly logger = new Logger(NewsletterSubscriberService.name);
  private readonly doubleOptIn: boolean;
  private readonly enabled: boolean;
  private readonly confirmationTtlMinutes: number;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly subscriberRepository: NewsletterSubscriberRepository,
    private readonly listRepository: NewsletterListRepository,
    private readonly tokenService: NewsletterTokenService,
    private readonly mailer: NewsletterMailerService,
    configService: ConfigService,
  ) {
    this.enabled = configService.get<string>("NEWSLETTER_ENABLED") === "true";
    this.doubleOptIn = configService.get<string>("NEWSLETTER_DOUBLE_OPT_IN") === "true";
    this.confirmationTtlMinutes = configService.getOrThrow<number>("NEWSLETTER_CONFIRMATION_TTL_MINUTES");
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  // ---------------------------------------------------------------- public

  /**
   * Public subscribe entry point.
   *
   * Always reports the same message and never leaks whether an address is already on the
   * list: an attacker must not be able to use this endpoint to test who subscribes to us.
   */
  async subscribe(dto: SubscribeNewsletterDto, context: RequestContext): Promise<SubscribeNewsletterResponse> {
    if (!this.enabled) {
      throw new ServiceUnavailableException("Newsletter subscriptions are currently unavailable");
    }

    if (dto.website) {
      // Honeypot filled: accept silently so bots get no signal.
      return {
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        email: dto.email,
        message: "Almost done - please confirm the subscription from your inbox.",
        alreadySubscribed: false,
      };
    }

    const list = await this.resolveList(dto.list);
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

    // Re-subscribing (or retrying after a failed confirmation) resets the existing record.
    const subscriber = existing
      ? this.reopen(existing, dto, context)
      : this.buildNew(list, dto, emailNormalized, context);

    // The token can only be minted once the row exists, because it embeds the uuid.
    const saved = await this.subscriberRepository.save(subscriber);
    const token = this.tokenService.createConfirmationToken(saved.uuid, this.confirmationTtlMinutes);
    saved.confirmationTokenHash = this.tokenService.hashToken(token);
    saved.confirmationExpiresAt = new Date(Date.now() + this.confirmationTtlMinutes * 60_000);
    await this.subscriberRepository.save(saved);

    if (!this.doubleOptIn) {
      return await this.confirmInternal(saved, false);
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
      message: "Almost done - please confirm the subscription from your inbox.",
      alreadySubscribed: false,
    };
  }

  /** Handles the double opt-in link. Idempotent: a second click is a no-op success. */
  async confirm(token: string): Promise<SubscribeNewsletterResponse> {
    const payload = this.tokenService.verifyToken(token, "confirm");
    const subscriber = await this.subscriberRepository.findByUuid(payload.subscriberUuid);
    if (!subscriber) {
      throw new NotFoundException("This subscription link is no longer valid");
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

  /** Self-service unsubscribe, used by the email footer and the RFC 805 one-click POST. */
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

    // A fresh manage token lets the recipient switch some topics back on without
    // resubscribing from scratch.
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

  /**
   * Reads the self-service subscription state behind a manage token.
   *
   * A fresh manage token is returned on every call and the old one is re-hashed, so a
   * leaked link stops working as soon as the subscriber uses it themselves.
   */
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

    subscriber.preferences = preferences;
    await this.subscriberRepository.save(subscriber);

    return {
      email: subscriber.email,
      status: subscriber.status,
      preferences: subscriber.preferences,
      resubscribeToken: await this.rotateManageToken(subscriber),
    };
  }

  /** Resubscribes an unsubscribed address without a new double opt-in round trip. */
  async resubscribe(token: string): Promise<SubscribeNewsletterResponse> {
    const payload = this.tokenService.verifyToken(token, "manage");
    const subscriber = await this.requireByUuid(payload.subscriberUuid);

    subscriber.status = NewsletterSubscriberStatus.SUBSCRIBED;
    subscriber.subscribedAt = new Date();
    subscriber.unsubscribedAt = null;
    subscriber.preferences = { categories: [], marketing: true };
    await this.subscriberRepository.save(subscriber);

    return {
      status: NewsletterSubscriberStatus.SUBSCRIBED,
      email: subscriber.email,
      message: "Welcome back - your subscription is active again.",
      alreadySubscribed: false,
    };
  }

  // ----------------------------------------------------------------- admin

  async findAll(query: NewsletterSubscriberQueryDto): Promise<{
    items: NewsletterSubscriberResponse[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const [subscribers, total] = await this.subscriberRepository.findPaginated(query);

    return {
      items: subscribers.map((subscriber) => toNewsletterSubscriberResponse(subscriber)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async stats(listId?: string): Promise<NewsletterSubscriberStats> {
    const counts = await this.subscriberRepository.countByStatus(listId ? BigInt(listId) : undefined);

    return buildNewsletterSubscriberStats({
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
      pending: counts[NewsletterSubscriberStatus.PENDING],
      subscribed: counts[NewsletterSubscriberStatus.SUBSCRIBED],
      unsubscribed: counts[NewsletterSubscriberStatus.UNSUBSCRIBED],
      bounced: counts[NewsletterSubscriberStatus.BOUNCED],
      complained: counts[NewsletterSubscriberStatus.COMPLAINED],
    });
  }

  async findOne(id: bigint): Promise<NewsletterSubscriberResponse> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }
    return toNewsletterSubscriberResponse(subscriber);
  }

  async updateStatus(id: bigint, dto: UpdateSubscriberStatusDto): Promise<NewsletterSubscriberResponse> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }

    subscriber.status = dto.status;
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;

    if (dto.status === NewsletterSubscriberStatus.SUBSCRIBED) {
      subscriber.subscribedAt = subscriber.subscribedAt ?? new Date();
      subscriber.confirmedAt = subscriber.confirmedAt ?? new Date();
      subscriber.unsubscribedAt = null;
    }

    if (dto.status === NewsletterSubscriberStatus.UNSUBSCRIBED) {
      subscriber.unsubscribedAt = new Date();
    }

    await this.subscriberRepository.save(subscriber);
    return toNewsletterSubscriberResponse(subscriber);
  }

  async remove(id: bigint): Promise<void> {
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }
    subscriber.status = NewsletterSubscriberStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;
    await this.subscriberRepository.save(subscriber);
  }

  /**
   * Permanently suppresses an address after a bounce or a spam complaint.
   *
   * Applies to every list, not just the one that triggered it: a hard-bounced or
   * complaining address must never receive another campaign.
   */
  async suppressAddress(email: string, status: NewsletterSubscriberStatus): Promise<void> {
    await this.subscriberRepository.suppress(normalizeEmail(email), status);
    this.logger.warn(`Suppressed ${normalizeEmail(email)} after ${status} feedback`);
  }

  // ----------------------------------------------------------------- lists

  async findLists(): Promise<NewsletterListResponse[]> {
    const [lists, counts] = await Promise.all([this.listRepository.findAll(), this.listRepository.countsByList()]);

    return lists.map((list) => toNewsletterListResponse(list, counts.get(String(list.id)) ?? 0));
  }

  async createList(dto: CreateNewsletterListDto): Promise<NewsletterListResponse> {
    if (dto.slug && (await this.listRepository.findBySlug(dto.slug))) {
      throw new BadRequestException(`A list with slug '${dto.slug}' already exists`);
    }

    const created = await this.listRepository.create(dto);

    if (dto.makeDefault) {
      await this.listRepository.makeDefault(created.id);
      created.isDefault = true;
    }

    return toNewsletterListResponse(created, 0);
  }

  async updateList(id: bigint, dto: UpdateNewsletterListDto): Promise<NewsletterListResponse> {
    const list = await this.listRepository.update(id, dto);
    if (!list) {
      throw new NotFoundException("Mailing list not found");
    }

    if (dto.makeDefault) {
      await this.listRepository.makeDefault(id);
      list.isDefault = true;
    }

    const counts = await this.listRepository.countsByList();
    return toNewsletterListResponse(list, counts.get(String(list.id)) ?? 0);
  }

  /** Default list lookup used when a public request does not name one. */
  async requireDefaultList(): Promise<NewsletterList> {
    const list = await this.listRepository.findDefault();
    if (!list) {
      throw new ServiceUnavailableException("No mailing list is configured");
    }
    return list;
  }

  async requireList(id: bigint): Promise<NewsletterList> {
    const list = await this.listRepository.findById(id);
    if (!list) {
      throw new NotFoundException("Mailing list not found");
    }
    return list;
  }

  // -------------------------------------------------------------- internal

  /**
   * Confirms a pending subscription.
   *
   * `sendWelcome` is false when the double opt-in step was disabled by configuration,
   * in which case the subscriber never received a confirmation email to click.
   */
  private async confirmInternal(
    subscriber: NewsletterSubscriber,
    sendWelcome: boolean,
  ): Promise<SubscribeNewsletterResponse> {
    subscriber.status = NewsletterSubscriberStatus.SUBSCRIBED;
    subscriber.confirmedAt = new Date();
    subscriber.subscribedAt = subscriber.subscribedAt ?? new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationExpiresAt = null;

    // Rotating the token on confirm means the link cannot be replayed afterwards.
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

  private async resolveList(slug?: string): Promise<NewsletterList> {
    if (!slug) {
      return await this.requireDefaultList();
    }

    const list = await this.listRepository.findBySlug(slug);
    if (!list?.isActive) {
      throw new NotFoundException("Mailing list not found");
    }
    return list;
  }

  private buildNew(
    list: NewsletterList,
    dto: SubscribeNewsletterDto,
    emailNormalized: string,
    context: RequestContext,
  ): NewsletterSubscriber {
    const subscriber = new NewsletterSubscriber();
    subscriber.listId = list.id;
    subscriber.email = dto.email.trim();
    subscriber.emailNormalized = emailNormalized;
    subscriber.name = dto.name ?? null;
    subscriber.status = NewsletterSubscriberStatus.PENDING;
    subscriber.source = dto.source;
    subscriber.preferences = dto.preferences ?? { categories: [], marketing: true };
    subscriber.attributes = {};
    subscriber.ipAddress = context.ipAddress ?? null;
    subscriber.userAgent = context.userAgent ?? null;
    subscriber.userId = context.userId ?? null;
    subscriber.organizationId = dto.organizationId ? BigInt(dto.organizationId) : null;
    // Required, non-null column: the real value is minted on confirmation.
    subscriber.unsubscribeTokenHash = this.tokenService.hashToken(this.tokenService.createOpaqueToken());
    return subscriber;
  }

  private reopen(
    existing: NewsletterSubscriber,
    dto: SubscribeNewsletterDto,
    context: RequestContext,
  ): NewsletterSubscriber {
    existing.email = dto.email;
    existing.name = dto.name ?? existing.name;
    existing.source = dto.source;
    existing.status = NewsletterSubscriberStatus.PENDING;
    existing.unsubscribedAt = null;
    existing.ipAddress = context.ipAddress ?? existing.ipAddress;
    existing.userAgent = context.userAgent ?? existing.userAgent;
    existing.userId = context.userId ?? existing.userId;
    existing.organizationId = dto.organizationId ? BigInt(dto.organizationId) : existing.organizationId;
    if (dto.preferences) {
      existing.preferences = dto.preferences;
    }
    return existing;
  }
}

/**
 * Lowercases the address for matching. The local part is intentionally only trimmed:
 * dot-stripping or `+tag` removal is provider-specific and would split addresses that
 * the receiving server considers identical.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
