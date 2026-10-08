import { BadRequestException, Injectable } from "@nestjs/common";
import { NewsletterAction, NewsletterStatus } from "@orgatick/contracts";
import { Newsletter } from "../entities/newsletter.entity";
import { NewsletterRecipientRepository } from "../repositories/newsletter-recipient.repository";
import { NewsletterRepository } from "../repositories/newsletter.repository";
import { NewsletterDispatchService } from "./newsletter-dispatch.service";
import type { NewsletterActor } from "../types/newsletter.types";

const EDITABLE: NewsletterStatus[] = [NewsletterStatus.DRAFT, NewsletterStatus.SCHEDULED];

@Injectable()
export class NewsletterCampaignActionsService {
  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly recipientRepository: NewsletterRecipientRepository,
    private readonly dispatchService: NewsletterDispatchService,
  ) {}

  async performAction(
    campaign: Newsletter,
    action: NewsletterAction,
    options: { scheduledAt?: string; reason?: string },
    actor: NewsletterActor,
  ): Promise<void> {
    campaign.updatedBy = actor.id;

    switch (action) {
      case NewsletterAction.SEND: {
        const wedged = await this.dispatchService.isWedged(campaign);
        if (!EDITABLE.includes(campaign.status) && !wedged) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be sent`);
        }
        await this.dispatchService.queue(campaign, actor);
        break;
      }
      case NewsletterAction.SCHEDULE:
      case NewsletterAction.RESCHEDULE: {
        if (!EDITABLE.includes(campaign.status)) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be scheduled`);
        }
        if (!options.scheduledAt) {
          throw new BadRequestException("A schedule time is required");
        }
        const scheduledAt = new Date(options.scheduledAt);
        if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
          throw new BadRequestException("Scheduled time must be a future date");
        }
        campaign.scheduledAt = scheduledAt;
        campaign.status = NewsletterStatus.SCHEDULED;
        campaign.errorMessage = null;
        break;
      }
      case NewsletterAction.PAUSE: {
        if (campaign.status !== NewsletterStatus.SENDING) {
          throw new BadRequestException("Only a sending campaign can be paused");
        }
        campaign.status = NewsletterStatus.PAUSED;
        break;
      }
      case NewsletterAction.RESUME: {
        if (campaign.status !== NewsletterStatus.PAUSED) {
          throw new BadRequestException("Only a paused campaign can be resumed");
        }
        campaign.status = NewsletterStatus.SENDING;
        break;
      }
      case NewsletterAction.CANCEL: {
        if (campaign.status === NewsletterStatus.SENT || campaign.status === NewsletterStatus.CANCELLED) {
          throw new BadRequestException(`A ${campaign.status} campaign cannot be cancelled`);
        }
        campaign.status = NewsletterStatus.CANCELLED;
        campaign.cancelledAt = new Date();
        await this.recipientRepository.skipPending(campaign.id);
        break;
      }
      case NewsletterAction.RETRY_FAILED: {
        if (![NewsletterStatus.SENT, NewsletterStatus.FAILED, NewsletterStatus.PAUSED].includes(campaign.status)) {
          throw new BadRequestException("Only a completed, failed or paused campaign can retry failed recipients");
        }
        const requeued = await this.recipientRepository.requeueFailed(campaign.id);
        if (requeued.length === 0) {
          throw new BadRequestException("There are no failed recipients left to retry");
        }
        campaign.status = NewsletterStatus.SENDING;
        campaign.completedAt = null;
        campaign.failedCount = 0;
        await this.newsletterRepository.save(campaign);
        await this.dispatchService.requeueRecipients(campaign, requeued);
        break;
      }
      default:
        throw new BadRequestException("Unsupported campaign action");
    }

    await this.newsletterRepository.save(campaign);
  }
}
