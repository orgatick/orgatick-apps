import { Injectable } from "@nestjs/common";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import type { OrganizationHistories } from "../types/admin.types";

@Injectable()
export class AdminTrackingService {
  constructor(private readonly trackingRepository: AdminTrackingRepository) {}

  async getHistories(organizationId: bigint): Promise<OrganizationHistories> {
    const [status, verification, ownership] = await Promise.all([
      this.trackingRepository.getStatusHistory(organizationId),
      this.trackingRepository.getVerificationHistory(organizationId),
      this.trackingRepository.getOwnershipHistory(organizationId),
    ]);
    return { status, verification, ownership };
  }

  async getNotes(organizationId: bigint) {
    return this.trackingRepository.getNotes(organizationId);
  }
}
