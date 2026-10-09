import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { UpdateOrganizationPricingControlDto } from "@orgatick/contracts";
import { OrganizationPaymentAccountStatus, OrganizationBankAccountStatus } from "@orgatick/contracts";
import { OrganizationDocumentStatus } from "../../organization/enums/organization-document-status.enum";
import { OrganizationDocumentType } from "../../organization/enums/organization-document-type.enum";
import Organization from "../../organization/entities/organization.entity";
import { OrganizationDocument } from "../../organization-governance/entities/organization-document.entity";
import { OrganizationPaymentAccount } from "../entities/organization-payment-account.entity";
import { OrganizationPricingSetting } from "../entities/organization-pricing-setting.entity";
import { OrganizationBankAccount } from "../entities/organization-bank-account.entity";
import { OrganizationPricingRepository } from "../repositories/pricing.repository";
import { OrganizationPricingMailerService } from "./organization-pricing-mailer.service";
import { OrganizationFinanceRepository } from "../repositories/finance.repository";

export interface PricingEligibilityResult {
  organizationId: string;
  paidEventsEnabled: boolean;
  requireBankDetails: boolean;
  bankDetailsVerified: boolean;
  eligibleForPaidEvents: boolean;
  commissionPercentage?: number;
  reasons: string[];
}

@Injectable()
export class OrganizationPricingService {
  constructor(
    private readonly pricingRepository: OrganizationPricingRepository,
    private readonly financeRepository: OrganizationFinanceRepository,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationPaymentAccount)
    private readonly paymentAccountRepository: Repository<OrganizationPaymentAccount>,
    @InjectRepository(OrganizationDocument)
    private readonly documentRepository: Repository<OrganizationDocument>,
    @InjectRepository(OrganizationBankAccount)
    private readonly bankAccountRepository: Repository<OrganizationBankAccount>,
    private readonly mailerService: OrganizationPricingMailerService,
  ) {}

  async initialize(organizationId: bigint): Promise<OrganizationPricingSetting> {
    return this.pricingRepository.ensure(organizationId, {
      paidEventsEnabled: false,
      requireBankDetails: true,
    });
  }

  async getPricingSetting(organizationId: bigint): Promise<OrganizationPricingSetting> {
    return this.pricingRepository.ensure(organizationId);
  }

  async updatePricingSetting(
    organizationId: bigint,
    dto: UpdateOrganizationPricingControlDto,
    actor?: { id: bigint; name: string } | null,
  ): Promise<OrganizationPricingSetting> {
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: {
        creator: true,
        members: { user: true, role: true },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const setting = await this.pricingRepository.ensure(organizationId);

    setting.paidEventsEnabled = dto.paidEventsEnabled;
    setting.requireBankDetails = dto.requireBankDetails;
    setting.disabledReason = dto.paidEventsEnabled ? null : (dto.disabledReason ?? null);
    setting.updatedBy = actor?.id ?? null;

    const saved = await this.pricingRepository.save(setting);

    // Keep Organization.allowPaidEvents in sync for backward compatibility
    if (org.allowPaidEvents !== dto.paidEventsEnabled) {
      org.allowPaidEvents = dto.paidEventsEnabled;
      await this.organizationRepository.save(org);
    }

    // Notify organization owner/lead
    const ownerOrAdmin =
      org.members?.find(
        (m) =>
          m.role &&
          (m.role.key === "OWNER" || m.role.key === "owner" || m.role.key === "ADMIN" || m.role.key === "admin"),
      )?.user ?? org.creator;

    const targetEmail = org.email || ownerOrAdmin?.email;
    const targetName = ownerOrAdmin?.name || org.name;

    if (targetEmail) {
      await this.mailerService.sendPricingUpdatedNotification({
        recipientEmail: targetEmail,
        recipientName: targetName,
        organizationName: org.name,
        paidEventsEnabled: dto.paidEventsEnabled,
        requireBankDetails: dto.requireBankDetails,
        disabledReason: setting.disabledReason,
        updatedByName: actor?.name ?? null,
      });
    }

    return saved;
  }

  async checkEligibility(organizationId: bigint): Promise<PricingEligibilityResult> {
    const setting = await this.pricingRepository.ensure(organizationId);
    const commission = await this.financeRepository.ensure(organizationId);

    // 1. Check for active payment account (Stripe/Bank/etc.)
    const activePaymentAccount = await this.paymentAccountRepository.findOne({
      where: {
        organizationId,
        status: OrganizationPaymentAccountStatus.ACTIVE,
      },
    });

    // 2. Check for verified BANK_ACCOUNT document
    const verifiedBankDocument = await this.documentRepository.findOne({
      where: {
        organizationId,
        type: OrganizationDocumentType.BANK_ACCOUNT,
        status: OrganizationDocumentStatus.VERIFIED,
      },
    });

    // 3. Check for verified OrganizationBankAccount record
    const verifiedBankAccount = await this.bankAccountRepository.findOne({
      where: {
        organizationId,
        status: OrganizationBankAccountStatus.VERIFIED,
      },
    });

    const bankDetailsVerified = Boolean(activePaymentAccount || verifiedBankDocument || verifiedBankAccount);

    const reasons: string[] = [];

    if (!setting.paidEventsEnabled) {
      reasons.push(
        setting.disabledReason || "Paid event creation is disabled for this organization by platform administration.",
      );
    }

    if (setting.requireBankDetails && !bankDetailsVerified) {
      reasons.push("Organization must add and verify bank details before creating or publishing paid events.");
    }

    const eligibleForPaidEvents = reasons.length === 0;

    return {
      organizationId: String(organizationId),
      paidEventsEnabled: setting.paidEventsEnabled,
      requireBankDetails: setting.requireBankDetails,
      bankDetailsVerified,
      eligibleForPaidEvents,
      commissionPercentage: Number(commission.commissionPercentage),
      reasons,
    };
  }

  async validatePaidEventAllowed(organizationId: bigint): Promise<void> {
    const eligibility = await this.checkEligibility(organizationId);
    if (!eligibility.eligibleForPaidEvents) {
      throw new ForbiddenException(
        eligibility.reasons.join(" ") || "Organization is not eligible to create or publish paid events.",
      );
    }
  }
}
