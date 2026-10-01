import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { AdminActor } from "../types/admin.types";

@Injectable()
export class AdminNoteService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly trackingRepository: AdminTrackingRepository,
  ) {}

  async addNote(organizationId: bigint, note: string, actor: AdminActor | null) {
    const organization = await this.organizationRepository.findOneBy({ id: organizationId });
    if (!organization) throw new NotFoundException("Organization not found");
    return this.trackingRepository.addNote(organizationId, note, actor?.id ?? null, actor?.name ?? null);
  }

  async listNotes(organizationId: bigint) {
    return this.trackingRepository.getNotes(organizationId);
  }
}
