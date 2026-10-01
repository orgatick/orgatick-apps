import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminStateRepository } from "../repositories/admin-state.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";
import { OrganizationRepository } from "../../organization/repositories";

@Injectable()
export class AdminAccessService {
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

  async block(id: bigint, reason: string, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.blocked = true;
    state.blockReason = reason;
    state.blockedBy = actor?.id ?? null;
    state.blockedAt = new Date();
    state.adminReason = reason;
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "blocked", reason, actor);
  }

  async unblock(id: bigint, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.blocked = false;
    state.blockReason = null;
    state.blockedBy = null;
    state.blockedAt = null;
    if (state.adminReason) state.adminReason = null;
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "unblocked", null, actor);
  }

  async hide(id: bigint, reason: string, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.hidden = true;
    state.hiddenReason = reason;
    state.hiddenBy = actor?.id ?? null;
    state.hiddenAt = new Date();
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "content_hidden", reason, actor);
  }

  async show(id: bigint, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.hidden = false;
    state.hiddenReason = null;
    state.hiddenBy = null;
    state.hiddenAt = null;
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "content_shown", null, actor);
  }

  async archive(id: bigint, reason: string, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.archived = true;
    state.archivedReason = reason;
    state.archivedBy = actor?.id ?? null;
    state.archivedAt = new Date();
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "archived", reason, actor);
  }

  async restore(id: bigint, actor: AdminActor | null) {
    const organization = await this.load(id);
    const state = await this.stateRepository.ensure(id);
    state.archived = false;
    state.archivedReason = null;
    state.archivedBy = null;
    state.archivedAt = null;
    await this.stateRepository.save(state);
    return this.track(id, organization.status, "restored", null, actor);
  }

  private async track(id: bigint, status: string, changeType: string, reason: string | null, actor: AdminActor | null) {
    await this.trackingRepository.recordStatusChange({
      organizationId: id,
      fromStatus: status,
      toStatus: status,
      changeType,
      reason,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });
    return this.organizationRepository.findAdminById(id);
  }
}
