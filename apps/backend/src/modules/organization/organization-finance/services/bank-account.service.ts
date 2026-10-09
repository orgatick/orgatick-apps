import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type {
  OrganizationBankAccountResponse,
  SaveOrganizationBankAccountDto,
  VerifyOrganizationBankAccountDto,
} from "@orgatick/contracts";
import { OrganizationBankAccountStatus, OrganizationBankAccountType } from "@orgatick/contracts";
import Organization from "../../organization/entities/organization.entity";
import { OrganizationBankAccount } from "../entities/organization-bank-account.entity";
import { OrganizationBankAccountRepository } from "../repositories/bank-account.repository";

export function maskAccountNumber(acc: string): { masked: string; last4: string } {
  const clean = acc.trim();
  const last4 = clean.slice(-4);
  const maskLength = Math.max(clean.length - 4, 4);
  const masked = `${"•".repeat(maskLength)}${last4}`;
  return { masked, last4 };
}

export function mapBankAccountToResponse(
  entity: OrganizationBankAccount,
  includeRaw = false,
): OrganizationBankAccountResponse {
  const { masked, last4 } = maskAccountNumber(entity.accountNumber);
  return {
    id: String(entity.id),
    organizationId: String(entity.organizationId),
    accountHolderName: entity.accountHolderName,
    accountNumber: includeRaw ? entity.accountNumber : undefined,
    accountNumberMasked: masked,
    accountNumberLast4: last4,
    ifscCode: entity.ifscCode,
    bankName: entity.bankName,
    branchName: entity.branchName ?? null,
    accountType: entity.accountType,
    status: entity.status,
    verificationNotes: entity.verificationNotes ?? null,
    documentId: entity.documentId ? String(entity.documentId) : null,
    verifiedAt: entity.verifiedAt ? entity.verifiedAt.toISOString() : null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

@Injectable()
export class OrganizationBankAccountService {
  constructor(
    private readonly bankAccountRepository: OrganizationBankAccountRepository,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async getBankAccount(organizationId: bigint, includeRaw = false): Promise<OrganizationBankAccountResponse | null> {
    const account = await this.bankAccountRepository.findByOrganizationId(organizationId);
    if (!account) return null;
    return mapBankAccountToResponse(account, includeRaw);
  }

  async saveBankAccount(
    organizationId: bigint,
    dto: SaveOrganizationBankAccountDto,
    _actorId?: bigint,
  ): Promise<OrganizationBankAccountResponse> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    let account = await this.bankAccountRepository.findByOrganizationId(organizationId);

    if (account) {
      // If critical payout information changed, reset status to PENDING
      const criticalChanged =
        account.accountNumber !== dto.accountNumber.trim() ||
        account.ifscCode !== dto.ifscCode.trim().toUpperCase() ||
        account.accountHolderName !== dto.accountHolderName.trim();

      account.accountHolderName = dto.accountHolderName.trim();
      account.accountNumber = dto.accountNumber.trim();
      account.ifscCode = dto.ifscCode.trim().toUpperCase();
      account.bankName = dto.bankName.trim();
      account.branchName = dto.branchName ? dto.branchName.trim() : null;
      account.accountType = dto.accountType as OrganizationBankAccountType;
      account.documentId = dto.documentId ? BigInt(dto.documentId) : null;

      if (criticalChanged && account.status !== OrganizationBankAccountStatus.PENDING) {
        account.status = OrganizationBankAccountStatus.PENDING;
        account.verifiedAt = null;
        account.verifiedBy = null;
        account.verificationNotes = null;
      }
    } else {
      account = this.bankAccountRepository.create({
        organizationId,
        accountHolderName: dto.accountHolderName.trim(),
        accountNumber: dto.accountNumber.trim(),
        ifscCode: dto.ifscCode.trim().toUpperCase(),
        bankName: dto.bankName.trim(),
        branchName: dto.branchName ? dto.branchName.trim() : null,
        accountType: dto.accountType as OrganizationBankAccountType,
        status: OrganizationBankAccountStatus.PENDING,
        documentId: dto.documentId ? BigInt(dto.documentId) : null,
        verificationNotes: null,
        verifiedAt: null,
        verifiedBy: null,
      });
    }

    const saved = await this.bankAccountRepository.save(account);
    return mapBankAccountToResponse(saved);
  }

  async verifyBankAccount(
    organizationId: bigint,
    dto: VerifyOrganizationBankAccountDto,
    actorId: bigint,
  ): Promise<OrganizationBankAccountResponse> {
    const account = await this.bankAccountRepository.findByOrganizationId(organizationId);
    if (!account) {
      throw new NotFoundException(`Bank account for organization ${organizationId} not found`);
    }

    account.status = dto.status as OrganizationBankAccountStatus;
    account.verificationNotes = dto.verificationNotes ? dto.verificationNotes.trim() : null;
    account.verifiedBy = actorId;

    if (dto.status === OrganizationBankAccountStatus.VERIFIED) {
      account.verifiedAt = new Date();
    } else {
      account.verifiedAt = null;
    }

    const saved = await this.bankAccountRepository.save(account);
    return mapBankAccountToResponse(saved, true);
  }
}
