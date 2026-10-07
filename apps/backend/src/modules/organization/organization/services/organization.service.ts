import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { Transactional } from "typeorm-transactional";
import { R2Storage } from "../../../../infrastructure/storage/r2/r2.storage";
import { DEFAULT_ROLE_KEYS } from "../../../../common/authorization/roles/default-roles";
import { AddressesService } from "../../../address/services/addresses.service";
import { OrganizationCategoryService } from "../../organization-category/services/category.service";
import { AdminTrackingRepository } from "../../organization-admin/repositories/admin-tracking.repository";
import { OrganizationVerification } from "../../organization-governance/entities/organization-verification.entity";
import { OrganizationMemberStatus } from "../../organization-member/enums/organization-member-status.enum";
import { OrganizationMemberService } from "../../organization-member/services/member.service";
import { OrganizationFinanceService } from "../../organization-finance/services/finance.service";
import { OrganizationGovernanceService } from "../../organization-governance/services/governance.service";
import type { CreateOrganizationDto, OrganizationQueryDto, UpdateOrganizationDto } from "../dto";
import type { Organization } from "../entities";
import type CreateOrganizationRepo from "../interfaces/create-organization-repo.interface";
import { OrganizationRepository } from "../repositories/organization.repository";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly categoryService: OrganizationCategoryService,
    private readonly memberService: OrganizationMemberService,
    private readonly addressService: AddressesService,
    private readonly governanceService: OrganizationGovernanceService,
    private readonly financeService: OrganizationFinanceService,
    private readonly storage: R2Storage,
    @InjectRepository(OrganizationVerification)
    private readonly verificationRepository: Repository<OrganizationVerification>,
    private readonly trackingRepository: AdminTrackingRepository,
  ) {}

  private async generateUniqueSlug(name: string, customSlug?: string): Promise<string> {
    const baseSlug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug || "org";
    let exists = await this.organizationRepository.findOne({ where: { slug } });
    let counter = 1;

    while (exists) {
      slug = `${baseSlug}-${counter}`;
      exists = await this.organizationRepository.findOne({ where: { slug } });
      counter++;
    }

    return slug;
  }

  async create(userId: bigint, body: CreateOrganizationDto, files?: Express.Multer.File[]): Promise<Organization> {
    if (body.basicInfo.categoryId != null && body.basicInfo.subCategoryId != null) {
      await this.categoryService.validateCategoryAndSubCategory(
        BigInt(body.basicInfo.categoryId),
        BigInt(body.basicInfo.subCategoryId),
      );
    }

    const slug = await this.generateUniqueSlug(body.basicInfo.name, body.basicInfo.slug);
    const logoUrl = await this.uploadOrganizationLogo({ files, body });

    const organization = await this.createOrganization({ body, slug, userId, logo: logoUrl, files });

    return await this.findById(organization.id);
  }

  @Transactional()
  private async createOrganization(data: CreateOrganizationRepo): Promise<Organization> {
    try {
      const address = await this.addressService.CreateAddress(data.body.address);
      const organization = await this.organizationRepository.createOrganization({
        ...data,
        addressId: address.id,
      });

      // Member: Creator becomes OWNER
      await this.memberService.addOwner(organization.id, data.userId);

      // Governance: Verification + Risk Profile
      await this.governanceService.initialize(organization.id);

      // Finance: Commission Settings
      await this.financeService.initialize(organization.id);

      // Aggregate: Stats + Social Links + Support Contacts
      await this.organizationRepository.createStats(organization.id);
      await this.organizationRepository.addSocialLinks(organization.id, data.body.socialLinks ?? []);
      await this.organizationRepository.addSupportContacts(organization.id, data.body.supportContacts ?? []);

      // Governance: KYC Documents
      if (data.body.document && data.body.document.length > 0) {
        await this.governanceService.saveDocuments(organization.id, data.userId, data.body.document, data.files);
      }

      return organization;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new BadRequestException("Failed to create organization");
    }
  }

  async findAll(query: OrganizationQueryDto) {
    const [items, total] = await this.organizationRepository.findPaginated(query);
    const limit = query.limit ?? 10;
    const page = query.page ?? 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findByIdOrSlug(idOrSlug);
    if (!organization) {
      throw new NotFoundException(`Organization '${idOrSlug}' not found`);
    }
    return organization;
  }

  async findById(id: bigint): Promise<Organization> {
    return await this.findByIdOrSlug(id.toString());
  }

  async findMyOrganizations(userId: bigint) {
    const members = await this.memberService.getUserMemberships(userId);
    return members.map((m) => ({
      roleId: m.roleId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      organization: m.organization,
    }));
  }

  async update(userId: bigint, id: bigint, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.organizationRepository.findOne({
      where: { id },
      relations: { members: { role: true } },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }

    const userMember = org.members?.find(
      (m) => BigInt(m.userId) === userId && m.status === OrganizationMemberStatus.ACTIVE,
    );
    if (
      !userMember?.role ||
      (userMember.role.key !== DEFAULT_ROLE_KEYS.OWNER && userMember.role.key !== DEFAULT_ROLE_KEYS.ADMIN)
    ) {
      throw new ForbiddenException("You do not have permission to update this organization");
    }

    if (dto.name !== undefined) org.name = dto.name;
    if (dto.description !== undefined) org.description = dto.description;
    if (dto.logo !== undefined) org.logo = dto.logo;
    if (dto.email !== undefined) org.email = dto.email;
    if (dto.phoneNumber !== undefined) org.phoneNumber = dto.phoneNumber;
    if (dto.status !== undefined) org.status = dto.status;
    if (dto.allowPaidEvents !== undefined) org.allowPaidEvents = dto.allowPaidEvents;

    if (dto.categoryId !== undefined) {
      org.categoryId = dto.categoryId ? BigInt(dto.categoryId) : null;
    }
    if (dto.subCategoryId !== undefined) {
      org.subCategoryId = dto.subCategoryId ? BigInt(dto.subCategoryId) : null;
    }
    if (dto.addressId !== undefined) {
      org.addressId = dto.addressId ? BigInt(dto.addressId) : null;
    }

    await this.organizationRepository.save(org);

    return await this.findById(org.id);
  }

  private async uploadOrganizationLogo({
    files,
    body,
  }: {
    files?: Express.Multer.File[];
    body?: CreateOrganizationDto;
  }): Promise<string | null> {
    const logoFile = files?.find((f) => f.fieldname === "basicInfo.logo");
    if (!body?.basicInfo || !logoFile) return null;
    const uploadResult = await this.storage.uploadPublic({
      key: `organizations/logos/${Date.now()}-${body.basicInfo.name}`,
      buffer: logoFile.buffer,
      contentType: logoFile.mimetype,
      contentLength: logoFile.size,
    });
    return uploadResult.url;
  }

  async requestVerification(
    organizationId: bigint,
    actor: { id: bigint; name: string },
  ): Promise<OrganizationVerification> {
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: { members: { role: true } },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${organizationId}' not found`);
    }

    const userMember = org.members?.find(
      (m) => BigInt(m.userId) === actor.id && m.status === OrganizationMemberStatus.ACTIVE,
    );
    if (
      !userMember?.role ||
      (userMember.role.key !== DEFAULT_ROLE_KEYS.OWNER && userMember.role.key !== DEFAULT_ROLE_KEYS.ADMIN)
    ) {
      throw new ForbiddenException("Only owners and admins can request verification");
    }

    let verification = await this.verificationRepository.findOneBy({ organizationId });
    if (!verification) {
      verification = await this.verificationRepository.save(this.verificationRepository.create({ organizationId }));
    }

    if (verification.status === OrganizationVerificationStatus.VERIFIED) {
      throw new ConflictException("Organization is already verified");
    }

    verification.status = OrganizationVerificationStatus.PENDING;
    verification.rejectionReason = null;
    await this.verificationRepository.save(verification);

    await this.trackingRepository.recordVerificationAction({
      organizationId,
      action: "requested",
      note: null,
      actorId: actor.id,
      actorName: actor.name,
    });

    return verification;
  }
}
