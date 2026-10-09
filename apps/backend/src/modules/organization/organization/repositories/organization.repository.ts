import { Injectable } from "@nestjs/common";
import { DataSource, type DeepPartial, Repository, type SelectQueryBuilder } from "typeorm";
import { OrganizationStatus } from "@orgatick/contracts";
import type { OrganizationQueryDto } from "../dto/organization-query.dto";
import type { OrganizationSocialPlatform } from "../enums/organization-social-platform.enum";
import { Organization } from "../entities/organization.entity";
import { OrganizationSocialLink } from "../entities/organization-social-link.entity";
import { OrganizationStats } from "../entities/organization-stats.entity";
import { OrganizationSupportContact } from "../entities/organization-support-contact.entity";
import type CreateOrganizationRepo from "../interfaces/create-organization-repo.interface";

export interface OrganizationSocialLinkInput {
  platform: OrganizationSocialPlatform;
  url: string;
}

export interface OrganizationSupportContactInput {
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  isPrimary: boolean;
}

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
  constructor(dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }

  private createBaseQueryBuilder(): SelectQueryBuilder<Organization> {
    return this.createQueryBuilder("org")
      .leftJoinAndSelect("org.category", "category")
      .leftJoinAndSelect("org.subCategory", "subCategory")
      .leftJoinAndSelect("org.address", "address")
      .leftJoinAndSelect("address.country", "country")
      .leftJoinAndSelect("address.division", "division")
      .leftJoinAndSelect("address.city", "city")
      .leftJoinAndSelect("org.creator", "creator")
      .leftJoinAndSelect("org.stats", "stats")
      .leftJoinAndSelect("org.verification", "verification")
      .leftJoinAndSelect("org.adminState", "adminState")
      .leftJoinAndSelect("org.socialLinks", "socialLinks")
      .leftJoinAndSelect("org.supportContacts", "supportContacts")
      .leftJoinAndSelect("org.commissionSetting", "commissionSetting")
      .leftJoinAndSelect("org.pricingSetting", "pricingSetting");
  }

  /** Rich admin-only detail. Includes members with roles, documents, risk and warnings. */
  async findAdminById(id: bigint): Promise<Organization | null> {
    return this.createBaseQueryBuilder()
      .leftJoinAndSelect("org.members", "members")
      .leftJoinAndSelect("members.user", "memberUser")
      .leftJoinAndSelect("members.role", "memberRole")
      .leftJoinAndSelect("org.documents", "documents")
      .leftJoinAndSelect("documents.uploader", "docUploader")
      .leftJoinAndSelect("documents.reviewer", "docReviewer")
      .leftJoinAndSelect("org.risk", "risk")
      .leftJoinAndSelect("org.warnings", "warnings")
      .where("org.id = :id", { id })
      .getOne();
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Organization | null> {
    const isNumeric = /^\d+$/.test(idOrSlug);
    const qb = this.createBaseQueryBuilder()
      .leftJoinAndSelect("org.members", "members")
      .leftJoinAndSelect("members.user", "memberUser");

    if (isNumeric) {
      qb.where("org.id = :id", { id: BigInt(idOrSlug) });
    } else {
      qb.where("org.slug = :slug", { slug: idOrSlug });
    }

    return await qb.getOne();
  }

  async findPaginated(query: OrganizationQueryDto): Promise<[Organization[], number]> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      subCategoryId,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.createBaseQueryBuilder();

    if (search && search.trim().length > 0) {
      qb.andWhere("(org.name ILIKE :search OR org.slug ILIKE :search OR org.description ILIKE :search)", {
        search: `%${search.trim()}%`,
      });
    }

    if (categoryId) {
      qb.andWhere("org.categoryId = :categoryId", { categoryId });
    }

    if (subCategoryId) {
      qb.andWhere("org.subCategoryId = :subCategoryId", { subCategoryId });
    }

    if (status) {
      qb.andWhere("org.status = :status", { status });
    }

    const extra = query as OrganizationQueryDto & {
      verificationStatus?: string;
      blocked?: boolean;
      archived?: boolean;
    };

    if (extra.verificationStatus) {
      qb.andWhere("verification.status = :verificationStatus", { verificationStatus: extra.verificationStatus });
    }

    if (extra.blocked === true) {
      qb.andWhere("adminState.blocked = :blocked", { blocked: true });
    } else if (extra.blocked === false) {
      qb.andWhere("(adminState.blocked = false OR adminState.blocked IS NULL)");
    }

    if (extra.archived === true) {
      qb.andWhere("adminState.archived = :archived", { archived: true });
    } else if (extra.archived === false) {
      qb.andWhere("(adminState.archived = false OR adminState.archived IS NULL)");
    }

    const validSortColumns: Record<string, string> = {
      created_at: "org.createdAt",
      name: "org.name",
      id: "org.id",
    };
    const sortColumn = validSortColumns[sortBy] || "org.createdAt";
    const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    qb.orderBy(sortColumn, direction).skip(skip).take(limit);

    return await qb.getManyAndCount();
  }

  async createOrganization(data: CreateOrganizationRepo): Promise<Organization> {
    const createdOrganization = this.create({
      name: data.body.basicInfo.name,
      slug: data.slug,
      categoryId: data.body.basicInfo.categoryId != null ? BigInt(data.body.basicInfo.categoryId) : null,
      subCategoryId: data.body.basicInfo.subCategoryId != null ? BigInt(data.body.basicInfo.subCategoryId) : null,
      addressId: data.addressId != null ? BigInt(data.addressId) : null,
      description: data.body.basicInfo.description ?? null,
      logo: data.logo,
      email: data.body.basicInfo.email ?? null,
      phoneNumber: data.body.basicInfo.phoneNumber ?? null,
      status: OrganizationStatus.ACTIVE,
      createdBy: data.userId,
      allowPaidEvents: false,
    } satisfies DeepPartial<Organization>);
    return await this.save(createdOrganization);
  }

  async createStats(organizationId: bigint): Promise<OrganizationStats> {
    return this.manager.save(
      this.manager.create(OrganizationStats, {
        organizationId,
        totalEvents: 0,
        totalParticipants: 0,
        totalPaidRegistrations: 0,
        totalRevenue: 0.0,
      } satisfies DeepPartial<OrganizationStats>),
    );
  }

  async addSocialLinks(
    organizationId: bigint,
    links: OrganizationSocialLinkInput[],
  ): Promise<OrganizationSocialLink[]> {
    if (links.length === 0) return [];

    const entities = links.map((link) =>
      this.manager.create(OrganizationSocialLink, {
        organizationId,
        platform: link.platform,
        url: link.url,
      } satisfies DeepPartial<OrganizationSocialLink>),
    );
    return this.manager.save(entities);
  }

  async addSupportContacts(
    organizationId: bigint,
    contacts: OrganizationSupportContactInput[],
  ): Promise<OrganizationSupportContact[]> {
    if (contacts.length === 0) return [];

    const entities = contacts.map((contact) =>
      this.manager.create(OrganizationSupportContact, {
        organizationId,
        name: contact.name,
        email: contact.email ?? null,
        phoneNumber: contact.phoneNumber ?? null,
        isPrimary: contact.isPrimary ?? false,
      } satisfies DeepPartial<OrganizationSupportContact>),
    );
    return this.manager.save(entities);
  }

  async updateStatus(id: bigint, status: OrganizationStatus): Promise<Organization | null> {
    const organization = await this.findOneBy({ id });
    if (!organization) return null;

    organization.status = status;
    return await this.save(organization);
  }
}
