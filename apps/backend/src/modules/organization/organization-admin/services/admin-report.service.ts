import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import { OrganizationRepository } from "../../organization/repositories/organization.repository";
import { OrganizationReport } from "../entities/organization-report.entity";
import { OrganizationReportStatus } from "../enums/organization-report-status.enum";
import type { AdminReportQueryDto, SubmitReportDto, UpdateReportStatusDto } from "../dto/admin-report.dto";

@Injectable()
export class AdminReportService {
  constructor(
    @InjectRepository(OrganizationReport)
    private readonly reportRepository: Repository<OrganizationReport>,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async submit(organizationId: bigint, reporterId: bigint, dto: SubmitReportDto): Promise<OrganizationReport> {
    const organization = await this.organizationRepository.findOneBy({ id: organizationId });
    if (!organization) throw new NotFoundException("Organization not found");

    const report = this.reportRepository.create({
      organizationId,
      reporterId,
      category: dto.category,
      description: dto.description,
      evidenceUrls: dto.evidenceUrls ?? null,
      status: OrganizationReportStatus.OPEN,
    });
    const saved = await this.reportRepository.save(report);
    return this.findById(saved.id);
  }

  async findAll(query: AdminReportQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const qb = this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.organization", "org")
      .leftJoinAndSelect("report.reporter", "reporter")
      .leftJoinAndSelect("report.resolver", "resolver");

    if (query.status) {
      qb.andWhere("report.status = :status", { status: query.status });
    }
    if (query.category) {
      qb.andWhere("report.category = :category", { category: query.category });
    }

    qb.orderBy("report.createdAt", "DESC").skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: bigint): Promise<OrganizationReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: { organization: { creator: true, verification: true }, reporter: true, resolver: true },
    });
    if (!report) throw new NotFoundException("Report not found");
    return report;
  }

  async setStatus(id: bigint, status: UpdateReportStatusDto["status"]): Promise<OrganizationReport> {
    const report = await this.findById(id);
    if (report.status === OrganizationReportStatus.RESOLVED || report.status === OrganizationReportStatus.REJECTED) {
      throw new BadRequestException("Cannot re-open a closed report");
    }
    report.status = status as OrganizationReportStatus;
    return this.reportRepository.save(report);
  }

  async resolve(id: bigint, resolution: string, actorId: bigint): Promise<OrganizationReport> {
    const report = await this.findById(id);
    report.status = OrganizationReportStatus.RESOLVED;
    report.resolution = resolution;
    report.resolvedBy = actorId;
    report.resolvedAt = new Date();
    return this.reportRepository.save(report);
  }

  async reject(id: bigint, reason: string, actorId: bigint): Promise<OrganizationReport> {
    const report = await this.findById(id);
    report.status = OrganizationReportStatus.REJECTED;
    report.resolution = reason;
    report.resolvedBy = actorId;
    report.resolvedAt = new Date();
    return this.reportRepository.save(report);
  }
}
