import { Injectable } from "@nestjs/common";
import type { OrganizationDocumentType } from "@orgatick/contracts";
import { R2Storage } from "../../../../infrastructure/storage/r2/r2.storage";
import type { OrganizationDocument } from "../entities/organization-document.entity";
import type { OrganizationRisk } from "../entities/organization-risk.entity";
import type { OrganizationVerification } from "../entities/organization-verification.entity";
import {
  type OrganizationDocumentInput,
  OrganizationGovernanceRepository,
} from "../repositories/governance.repository";

export interface OrganizationDocumentUploadInput {
  type: OrganizationDocumentType;
  file?: File | string | null | undefined;
}

@Injectable()
export class OrganizationGovernanceService {
  constructor(
    private readonly governanceRepository: OrganizationGovernanceRepository,
    private readonly storage: R2Storage,
  ) {}

  async initialize(
    organizationId: bigint,
  ): Promise<{ verification: OrganizationVerification; risk: OrganizationRisk }> {
    const verification = await this.governanceRepository.createVerification(organizationId);
    const risk = await this.governanceRepository.createRiskProfile(organizationId);
    return { verification, risk };
  }

  async saveDocuments(
    organizationId: bigint,
    uploadedBy: bigint,
    documents: OrganizationDocumentUploadInput[],
    files?: Express.Multer.File[],
  ): Promise<OrganizationDocument[]> {
    const inputs: OrganizationDocumentInput[] = [];

    for (let idx = 0; idx < documents.length; idx++) {
      const doc = documents[idx];
      let fileUrl = typeof doc.file === "string" ? doc.file : "";

      const docFile = files?.find(
        (f) =>
          f.fieldname === `document_${idx}` ||
          f.fieldname === `document[${idx}]` ||
          f.fieldname === `documents[${idx}]` ||
          f.fieldname === doc.type.toLowerCase(),
      );

      if (docFile) {
        const uploadResult = await this.storage.uploadPrivate({
          key: `organizations/${organizationId}/documents/${Date.now()}-${docFile.originalname}`,
          buffer: docFile.buffer,
          contentType: docFile.mimetype,
          contentLength: docFile.size,
        });
        fileUrl = uploadResult.key;
      }

      if (fileUrl) {
        inputs.push({ type: doc.type, fileUrl });
      }
    }

    return this.governanceRepository.saveDocuments(organizationId, uploadedBy, inputs);
  }
}
