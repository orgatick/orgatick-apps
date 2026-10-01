import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { AdminActor } from "../types/admin.types";
import { OrganizationDocument } from "../../organization-governance/entities";
import { R2Storage } from "@/infrastructure/storage/r2/r2.storage";
import { OrganizationDocumentStatus } from "../../organization/enums";

@Injectable()
export class AdminDocumentService {
  constructor(
    @InjectRepository(OrganizationDocument)
    private readonly documentRepository: Repository<OrganizationDocument>,
    private readonly storage: R2Storage,
  ) {}

  async listDocuments(organizationId: bigint) {
    return this.documentRepository.find({
      where: { organizationId },
      relations: { uploader: true, reviewer: true },
      order: { createdAt: "DESC" },
    });
  }

  /** Returns a short-lived presigned URL so the admin browser can view the private file. */
  async getSignedUrl(organizationId: bigint, documentId: bigint, expiresIn = 3600) {
    const document = await this.load(organizationId, documentId);
    const fileUrl = await this.storage.getPrivateDownloadUrl(document.fileUrl, expiresIn);
    return { fileUrl, expiresIn, fileName: document.fileUrl.split("/").pop() ?? document.fileUrl };
  }

  private async load(organizationId: bigint, documentId: bigint) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, organizationId },
      relations: { uploader: true, reviewer: true },
    });
    if (!document) throw new NotFoundException("Document not found");
    return document;
  }

  async approve(organizationId: bigint, documentId: bigint, actor: AdminActor | null) {
    const document = await this.load(organizationId, documentId);
    document.status = OrganizationDocumentStatus.APPROVED;
    document.reviewedBy = actor?.id ?? null;
    document.reviewedAt = new Date();
    document.reviewNote = null;
    return this.documentRepository.save(document);
  }

  async reject(organizationId: bigint, documentId: bigint, reason: string, actor: AdminActor | null) {
    const document = await this.load(organizationId, documentId);
    document.status = OrganizationDocumentStatus.REJECTED;
    document.reviewedBy = actor?.id ?? null;
    document.reviewedAt = new Date();
    document.reviewNote = reason;
    return this.documentRepository.save(document);
  }

  async requestReplacement(organizationId: bigint, documentId: bigint, note: string, actor: AdminActor | null) {
    const document = await this.load(organizationId, documentId);
    document.status = OrganizationDocumentStatus.REPLACEMENT_REQUESTED;
    document.reviewedBy = actor?.id ?? null;
    document.reviewedAt = new Date();
    document.reviewNote = note;
    return this.documentRepository.save(document);
  }

  async verify(organizationId: bigint, documentId: bigint, actor: AdminActor | null) {
    const document = await this.load(organizationId, documentId);
    document.status = OrganizationDocumentStatus.VERIFIED;
    document.reviewedBy = actor?.id ?? null;
    document.reviewedAt = new Date();
    document.reviewNote = null;
    return this.documentRepository.save(document);
  }
}
