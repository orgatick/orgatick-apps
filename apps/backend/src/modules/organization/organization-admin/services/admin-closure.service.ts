import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { AdminStateRepository } from "../repositories/admin-state.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";

@Injectable()
export class AdminClosureService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly stateRepository: AdminStateRepository,
    private readonly trackingRepository: AdminTrackingRepository,
  ) {}

  private async load(id: bigint) {
    const organization = await this.organizationRepository.findOneBy({ id });
    if (!organization) throw new NotFoundException("Organization not found");
    return organization;
  }

  async requestClosure(id: bigint, reason: string, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    if (state.archived) throw new ConflictException("Organization is already archived");

    state.closureRequestedAt = new Date();
    state.closureRequestedBy = actor?.id ?? null;
    state.closureReason = reason;
    await this.stateRepository.save(state);

    await this.trackingRepository.recordStatusChange({
      organizationId: id,
      fromStatus: organization.status,
      toStatus: organization.status,
      changeType: "closure_requested",
      reason,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });
    return this.organizationRepository.findAdminById(id);
  }

  async approveClosure(id: bigint, actor: AdminActor | null, note?: string) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);

    state.archived = true;
    state.archivedAt = new Date();
    state.archivedBy = actor?.id ?? null;
    state.archivedReason = state.closureReason ?? note ?? "Closure approved";
    await this.stateRepository.save(state);

    await this.trackingRepository.recordStatusChange({
      organizationId: id,
      fromStatus: organization.status,
      toStatus: organization.status,
      changeType: "closure_approved",
      reason: state.archivedReason,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });
    return this.organizationRepository.findAdminById(id);
  }

  async rejectClosure(id: bigint, actor: AdminActor | null, reason?: string) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);

    state.closureRequestedAt = null;
    state.closureRequestedBy = null;
    state.closureReason = null;
    await this.stateRepository.save(state);

    await this.trackingRepository.recordStatusChange({
      organizationId: id,
      fromStatus: organization.status,
      toStatus: organization.status,
      changeType: "closure_rejected",
      reason: reason ?? null,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });
    return this.organizationRepository.findAdminById(id);
  }

  async permanentlyDelete(id: bigint) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    if (!state.archived) {
      throw new ConflictException("Only archived organizations can be permanently deleted");
    }
    await this.organizationRepository.remove(organization);
    return { id: id.toString(), deleted: true };
  }
}
