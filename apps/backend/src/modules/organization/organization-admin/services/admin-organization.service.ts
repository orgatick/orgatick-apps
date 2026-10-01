import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationStatus } from "../../organization/enums/organization-status.enum";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { AdminStateRepository } from "../repositories/admin-state.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import { AdminTrackingService } from "./admin-tracking.service";
import type { AdminActor } from "../types/admin.types";
import type { AdminOrganizationQueryDto } from "../dto/admin-organization.dto";

@Injectable()
export class AdminOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly stateRepository: AdminStateRepository,
    private readonly trackingRepository: AdminTrackingRepository,
    private readonly trackingService: AdminTrackingService,
  ) {}

  async findAll(query: AdminOrganizationQueryDto) {
    const [items, total] = await this.organizationRepository.findPaginated(query);
    return {
      items,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async findById(id: bigint) {
    const organization = await this.organizationRepository.findAdminById(id);
    if (!organization) throw new NotFoundException("Organization not found");

    const [notes, histories] = await Promise.all([
      this.trackingService.getNotes(id),
      this.trackingService.getHistories(id),
    ]);

    return {
      ...organization,
      notes,
      histories,
    };
  }

  async updateStatus(id: bigint, status: OrganizationStatus, reason?: string, actor?: AdminActor | null) {
    const organization = await this.organizationRepository.findOneBy({ id });
    if (!organization) throw new NotFoundException("Organization not found");

    const previousStatus = organization.status;
    organization.status = status;
    await this.organizationRepository.save(organization);

    const state = await this.stateRepository.ensure(id);
    state.adminReason = status === OrganizationStatus.ACTIVE ? null : (reason ?? null);
    await this.stateRepository.save(state);

    await this.trackingRepository.recordStatusChange({
      organizationId: id,
      fromStatus: previousStatus,
      toStatus: status,
      changeType: this.resolveChangeType(previousStatus, status),
      reason,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });

    return this.findById(id);
  }

  private resolveChangeType(from: OrganizationStatus, to: OrganizationStatus): string {
    if (to === OrganizationStatus.SUSPENDED) return "suspended";
    if (to === OrganizationStatus.INACTIVE) return "disabled";
    if (to === OrganizationStatus.ACTIVE) return from === OrganizationStatus.INACTIVE ? "restored" : "activated";
    return "status_changed";
  }
}
