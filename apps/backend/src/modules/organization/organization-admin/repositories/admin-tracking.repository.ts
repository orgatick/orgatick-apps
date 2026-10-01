import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository } from "typeorm";
import { OrganizationAdminNote } from "../entities/organization-admin-note.entity";
import { OrganizationOwnershipHistory } from "../entities/organization-ownership-history.entity";
import { OrganizationStatusHistory } from "../entities/organization-status-history.entity";
import { OrganizationVerificationLog } from "../entities/organization-verification-log.entity";

export interface StatusChangeInput {
  organizationId: bigint;
  fromStatus?: string | null;
  toStatus?: string | null;
  changeType: string;
  reason?: string | null;
  actorId?: bigint | null;
  actorName?: string | null;
}

export interface VerificationLogInput {
  organizationId: bigint;
  action: string;
  note?: string | null;
  actorId?: bigint | null;
  actorName?: string | null;
}

export interface OwnershipLogInput {
  organizationId: bigint;
  fromUserId?: bigint | null;
  fromUserName?: string | null;
  toUserId?: bigint | null;
  toUserName?: string | null;
  action: string;
  reason?: string | null;
  actorId?: bigint | null;
  actorName?: string | null;
}

@Injectable()
export class AdminTrackingRepository extends Repository<OrganizationStatusHistory> {
  constructor(dataSource: DataSource) {
    super(OrganizationStatusHistory, dataSource.createEntityManager());
  }

  async recordStatusChange(input: StatusChangeInput): Promise<OrganizationStatusHistory> {
    return this.save(
      this.create({
        organizationId: input.organizationId,
        fromStatus: input.fromStatus ?? null,
        toStatus: input.toStatus ?? null,
        changeType: input.changeType,
        reason: input.reason ?? null,
        changedBy: input.actorId ?? null,
        actorName: input.actorName ?? null,
      } satisfies DeepPartial<OrganizationStatusHistory>),
    );
  }

  async recordVerificationAction(input: VerificationLogInput): Promise<OrganizationVerificationLog> {
    return this.manager.save(
      this.manager.create(OrganizationVerificationLog, {
        organizationId: input.organizationId,
        action: input.action,
        note: input.note ?? null,
        changedBy: input.actorId ?? null,
        actorName: input.actorName ?? null,
      } satisfies DeepPartial<OrganizationVerificationLog>),
    );
  }

  async recordOwnership(input: OwnershipLogInput): Promise<OrganizationOwnershipHistory> {
    return this.manager.save(
      this.manager.create(OrganizationOwnershipHistory, {
        organizationId: input.organizationId,
        fromUserId: input.fromUserId ?? null,
        fromUserName: input.fromUserName ?? null,
        toUserId: input.toUserId ?? null,
        toUserName: input.toUserName ?? null,
        action: input.action,
        reason: input.reason ?? null,
        changedBy: input.actorId ?? null,
        actorName: input.actorName ?? null,
      } satisfies DeepPartial<OrganizationOwnershipHistory>),
    );
  }

  async addNote(organizationId: bigint, note: string, actorId?: bigint | null, actorName?: string | null) {
    return this.manager.save(
      this.manager.create(OrganizationAdminNote, {
        organizationId,
        note,
        createdBy: actorId ?? null,
        actorName: actorName ?? null,
      } satisfies DeepPartial<OrganizationAdminNote>),
    );
  }

  async getStatusHistory(organizationId: bigint): Promise<OrganizationStatusHistory[]> {
    return this.find({
      where: { organizationId },
      order: { createdAt: "DESC" },
      take: 100,
    });
  }

  async getVerificationHistory(organizationId: bigint): Promise<OrganizationVerificationLog[]> {
    return this.manager.find(OrganizationVerificationLog, {
      where: { organizationId },
      order: { createdAt: "DESC" },
      take: 100,
    });
  }

  async getOwnershipHistory(organizationId: bigint): Promise<OrganizationOwnershipHistory[]> {
    return this.manager.find(OrganizationOwnershipHistory, {
      where: { organizationId },
      order: { createdAt: "DESC" },
      take: 100,
    });
  }

  async getNotes(organizationId: bigint): Promise<OrganizationAdminNote[]> {
    return this.manager.find(OrganizationAdminNote, {
      where: { organizationId },
      order: { createdAt: "DESC" },
      take: 100,
    });
  }
}
