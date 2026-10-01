import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { type OrganizationDocumentType, OrganizationVerificationStatus } from "@orgatick/contracts";
import { OrganizationDocument } from "../entities/organization-document.entity";
import { OrganizationRisk } from "../entities/organization-risk.entity";
import { OrganizationVerification } from "../entities/organization-verification.entity";

export interface OrganizationDocumentInput {
  type: OrganizationDocumentType;
  fileUrl: string;
}

@Injectable()
export class OrganizationGovernanceRepository extends Repository<OrganizationVerification> {
  constructor(dataSource: DataSource) {
    super(OrganizationVerification, dataSource.createEntityManager());
  }

  async createVerification(organizationId: bigint): Promise<OrganizationVerification> {
    return this.save(
      this.create({
        organizationId,
        status: OrganizationVerificationStatus.PENDING,
      } satisfies DeepPartial<OrganizationVerification>),
    );
  }

  async createRiskProfile(organizationId: bigint): Promise<OrganizationRisk> {
    return this.manager.save(
      this.manager.create(OrganizationRisk, {
        organizationId,
        trustScore: 100.0,
        isFlagged: false,
      } satisfies DeepPartial<OrganizationRisk>),
    );
  }

  async saveDocuments(
    organizationId: bigint,
    uploadedBy: bigint,
    documents: OrganizationDocumentInput[],
  ): Promise<OrganizationDocument[]> {
    if (documents.length === 0) return [];

    const entities = documents.map((doc) =>
      this.manager.create(OrganizationDocument, {
        organizationId,
        type: doc.type,
        fileUrl: doc.fileUrl,
        uploadedBy,
      } satisfies DeepPartial<OrganizationDocument>),
    );
    return this.manager.save(entities);
  }
}
