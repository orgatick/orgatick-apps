import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { OrganizationMemberRepository } from "../../organization-member";
import { OrganizationOwnershipDispute } from "../entities/organization-ownership-dispute.entity";
import { OwnershipDisputeStatus } from "../enums/ownership-dispute-status.enum";
import { AdminTrackingRepository } from "../repositories/admin-tracking.repository";
import { AdminOwnershipService } from "./admin-ownership.service";
import type { AdminActor } from "../types/admin.types";
import type {
  OwnershipDisputeQueryDto,
  ResolveDisputeDto,
  SubmitDisputeDto,
  UpdateDisputeStatusDto,
} from "../dto/admin-ownership-dispute.dto";

@Injectable()
export class AdminOwnershipDisputeService {
  constructor(
    @InjectRepository(OrganizationOwnershipDispute)
    private readonly disputeRepository: Repository<OrganizationOwnershipDispute>,
    private readonly organizationRepository: OrganizationRepository,
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly trackingRepository: AdminTrackingRepository,
    private readonly ownershipService: AdminOwnershipService,
  ) {}

  async submit(
    organizationId: bigint,
    disputantId: bigint,
    dto: SubmitDisputeDto,
  ): Promise<OrganizationOwnershipDispute> {
    const organization = await this.organizationRepository.findOneBy({ id: organizationId });
    if (!organization) throw new NotFoundException("Organization not found");

    const membership = await this.memberRepository.findActiveMembership(organizationId, disputantId);
    if (!membership) throw new BadRequestException("Only active members can file an ownership dispute");

    const dispute = this.disputeRepository.create({
      organizationId,
      disputantId,
      status: OwnershipDisputeStatus.OPEN,
      freezeOwnership: false,
      reason: dto.reason,
      evidenceUrls: dto.evidenceUrls ?? null,
    });
    const saved = await this.disputeRepository.save(dispute);
    return this.findById(saved.id);
  }

  async findAll(query: OwnershipDisputeQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const qb = this.disputeRepository
      .createQueryBuilder("dispute")
      .leftJoinAndSelect("dispute.organization", "org")
      .leftJoinAndSelect("dispute.disputant", "disputant")
      .leftJoinAndSelect("dispute.currentOwner", "currentOwner");

    if (query.status) {
      qb.andWhere("dispute.status = :status", { status: query.status });
    }

    qb.orderBy("dispute.createdAt", "DESC").skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: bigint): Promise<OrganizationOwnershipDispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: {
        organization: { creator: true, verification: true, adminState: true },
        disputant: true,
        currentOwner: true,
        resolver: true,
      },
    });
    if (!dispute) throw new NotFoundException("Ownership dispute not found");
    return dispute;
  }

  async setStatus(id: bigint, status: UpdateDisputeStatusDto["status"]): Promise<OrganizationOwnershipDispute> {
    const dispute = await this.findById(id);
    if (dispute.status === OwnershipDisputeStatus.RESOLVED || dispute.status === OwnershipDisputeStatus.REJECTED) {
      throw new BadRequestException("Cannot re-open a closed dispute");
    }
    dispute.status = status as OwnershipDisputeStatus;
    return this.disputeRepository.save(dispute);
  }

  async setFreeze(id: bigint, frozen: boolean): Promise<OrganizationOwnershipDispute> {
    const dispute = await this.findById(id);
    dispute.freezeOwnership = frozen;
    return this.disputeRepository.save(dispute);
  }

  async resolve(id: bigint, dto: ResolveDisputeDto, actor: AdminActor): Promise<OrganizationOwnershipDispute> {
    const dispute = await this.findById(id);
    if (dispute.status === OwnershipDisputeStatus.RESOLVED || dispute.status === OwnershipDisputeStatus.REJECTED) {
      throw new BadRequestException("Dispute is already closed");
    }

    if (dto.toUserId) {
      const targetUserId = BigInt(dto.toUserId);
      if (Number(targetUserId) === Number(dispute.disputantId)) {
        await this.ownershipService.transfer(dispute.organizationId, targetUserId, dto.resolution, actor);
      } else {
        throw new ConflictException(
          "Resolution transfer must target the disputant unless ownership is otherwise granted",
        );
      }
    }

    dispute.status = OwnershipDisputeStatus.RESOLVED;
    dispute.resolution = dto.resolution;
    dispute.resolvedBy = actor.id;
    dispute.resolvedAt = new Date();
    dispute.freezeOwnership = false;

    const saved = await this.disputeRepository.save(dispute);

    await this.trackingRepository.recordOwnership({
      organizationId: dispute.organizationId,
      action: dto.toUserId ? "dispute_resolved_with_transfer" : "dispute_resolved",
      reason: dto.resolution,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });

    return saved;
  }

  async reject(id: bigint, reason: string, actor: AdminActor): Promise<OrganizationOwnershipDispute> {
    const dispute = await this.findById(id);
    if (dispute.status === OwnershipDisputeStatus.RESOLVED || dispute.status === OwnershipDisputeStatus.REJECTED) {
      throw new BadRequestException("Dispute is already closed");
    }

    dispute.status = OwnershipDisputeStatus.REJECTED;
    dispute.resolution = reason;
    dispute.resolvedBy = actor.id;
    dispute.resolvedAt = new Date();
    dispute.freezeOwnership = false;

    const saved = await this.disputeRepository.save(dispute);

    await this.trackingRepository.recordOwnership({
      organizationId: dispute.organizationId,
      action: "dispute_rejected",
      reason,
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? null,
    });

    return saved;
  }
}
