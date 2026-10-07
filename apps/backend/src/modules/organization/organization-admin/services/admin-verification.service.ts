import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { OrganizationVerification } from "../../organization-governance/entities/organization-verification.entity";
import { OrganizationDocument } from "../../organization-governance/entities/organization-document.entity";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";
import type { AdminVerificationQueryDto } from "../dto/admin-verification.dto";

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

  /** Global platform verification queue (§14). */
  async queue(query: AdminVerificationQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const qb = this.verificationRepository
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.organization", "org")
      .leftJoinAndSelect("org.creator", "creator")
      .addSelect(
        (sub) =>
          sub.select("COUNT(*)").from(OrganizationDocument, "doc").where("doc.organizationId = v.organizationId"),
        "document_count",
      );

    if (query.status) {
      qb.andWhere("v.status = :status", { status: query.status });
    }

    qb.orderBy("v.createdAt", "DESC").skip(skip).take(limit);

    const total = await qb.getCount();
    const { entities, raw } = await qb.getRawAndEntities();

    const items = entities.map((verification, index) => {
      const rawRow = raw[index] as Record<string, unknown> | undefined;
      return {
        organizationId: verification.organizationId,
        organizationName: verification.organization?.name ?? null,
        slug: verification.organization?.slug ?? null,
        logo: verification.organization?.logo ?? null,
        orgStatus: verification.organization?.status ?? null,
        ownerName: verification.organization?.creator?.name ?? null,
        status: verification.status,
        verifiedAt: verification.verifiedAt ?? null,
        rejectionReason: verification.rejectionReason ?? null,
        documentCount: Number(rawRow?.document_count ?? 0),
      };
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
