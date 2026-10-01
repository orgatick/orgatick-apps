import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { OrganizationVerification } from "../../organization-governance/entities/organization-verification.entity";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";

@Injectable()
export class AdminVerificationService {
  constructor(
    @InjectRepository(OrganizationVerification)
    private readonly verificationRepository: Repository<OrganizationVerification>,
    private readonly organizationRepository: OrganizationRepository,
    private readonly trackingRepository: AdminTrackingRepository,
  ) {}

  private async getRecord(id: bigint): Promise<OrganizationVerification> {
    const record =
      (await this.verificationRepository.findOneBy({ organizationId: id })) ??
      (await this.verificationRepository.save(this.verificationRepository.create({ organizationId: id })));
    return record;
  }

  private async track(id: bigint, action: string, note: string | null | undefined, actor: AdminActor | null) {
    await this.trackingRepository.recordVerificationAction({
      organizationId: id,
      action,
      note: note ?? null,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });
  }

  async approve(id: bigint, actor: AdminActor | null, note?: string) {
    const record = await this.getRecord(id);
    record.status = OrganizationVerificationStatus.VERIFIED;
    record.verifiedAt = new Date();
    record.verifiedBy = actor?.id ?? null;
    record.rejectionReason = null;
    record.lastCheckedBy = actor?.id ?? null;
    await this.verificationRepository.save(record);
    await this.track(id, "approved", note, actor);
    return this.organizationRepository.findAdminById(id);
  }

  async reject(id: bigint, actor: AdminActor | null, reason: string) {
    const record = await this.getRecord(id);
    record.status = OrganizationVerificationStatus.REJECTED;
    record.rejectionReason = reason;
    record.lastCheckedBy = actor?.id ?? null;
    await this.verificationRepository.save(record);
    await this.track(id, "rejected", reason, actor);
    return this.organizationRepository.findAdminById(id);
  }

  async revoke(id: bigint, actor: AdminActor | null, reason?: string) {
    const record = await this.getRecord(id);
    record.status = OrganizationVerificationStatus.PENDING;
    record.verifiedAt = null;
    record.verifiedBy = null;
    record.rejectionReason = null;
    record.lastCheckedBy = actor?.id ?? null;
    await this.verificationRepository.save(record);
    await this.track(id, "revoked", reason ?? null, actor);
    return this.organizationRepository.findAdminById(id);
  }

  async requestDocuments(id: bigint, actor: AdminActor | null, note: string) {
    await this.track(id, "documents_requested", note, actor);
    return this.organizationRepository.findAdminById(id);
  }

  async reverify(id: bigint, actor: AdminActor | null, note?: string) {
    const record = await this.getRecord(id);
    record.status = OrganizationVerificationStatus.VERIFIED;
    record.verifiedAt = new Date();
    record.verifiedBy = actor?.id ?? null;
    record.rejectionReason = null;
    record.lastCheckedBy = actor?.id ?? null;
    await this.verificationRepository.save(record);
    await this.track(id, "reverified", note ?? null, actor);
    return this.organizationRepository.findAdminById(id);
  }
}
