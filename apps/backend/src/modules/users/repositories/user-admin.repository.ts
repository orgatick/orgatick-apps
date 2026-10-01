import { Injectable } from "@nestjs/common";
import { DataSource, Repository, type SelectQueryBuilder } from "typeorm";
import { User } from "../entities/user.entity";
import { Organization } from "../../organization/organization/entities/organization.entity";
import { OrganizationMember } from "../../organization/organization-member/entities/organization-member.entity";
import type { OrganizationStatus } from "../../organization/organization/enums/organization-status.enum";
import { PlatformRole } from "../enums/platform-role.enums";
import type { AdminUserQueryDto } from "../dto/user-admin.dto";

@Injectable()
export class UserAdminRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  private createUserBaseQueryBuilder(): SelectQueryBuilder<User> {
    return this.createQueryBuilder("user")
      .leftJoinAndSelect("user.userAccount", "userAccount")
      .select([
        "user.id",
        "user.name",
        "user.email",
        "user.gender",
        "user.phoneNumber",
        "user.avatar",
        "user.address",
        "user.bio",
        "user.role",
        "user.createdAt",
        "user.updatedAt",
        "userAccount.id",
        "userAccount.provider",
        "userAccount.lastLoginAt",
      ]);
  }

  private createOrganizationBaseQueryBuilder(): SelectQueryBuilder<Organization> {
    return this.manager
      .createQueryBuilder(Organization, "org")
      .leftJoinAndSelect("org.category", "category")
      .leftJoinAndSelect("org.subCategory", "subCategory")
      .leftJoinAndSelect("org.address", "address")
      .leftJoinAndSelect("org.creator", "creator")
      .leftJoinAndSelect("org.stats", "stats");
  }

  async findPaginatedUsers(query: AdminUserQueryDto): Promise<[User[], number]> {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const qb = this.createUserBaseQueryBuilder();

    if (search && search.trim().length > 0) {
      qb.andWhere("(user.name ILIKE :search OR user.email ILIKE :search)", {
        search: `%${search.trim()}%`,
      });
    }

    if (role) {
      qb.andWhere("user.role = :role", { role });
    }

    const validSortColumns: Record<string, string> = {
      created_at: "user.createdAt",
      name: "user.name",
      id: "user.id",
      email: "user.email",
    };
    const sortColumn = validSortColumns[sortBy] || "user.createdAt";
    const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    qb.orderBy(sortColumn, direction)
      .addOrderBy("user.id", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    return await qb.getManyAndCount();
  }

  async findUserDetail(id: bigint): Promise<User | null> {
    return await this.createUserBaseQueryBuilder().where("user.id = :id", { id }).getOne();
  }

  async findById(id: bigint): Promise<User | null> {
    return await this.createQueryBuilder("user").where("user.id = :id", { id }).getOne();
  }

  async findUserMemberships(userId: bigint): Promise<OrganizationMember[]> {
    return await this.manager
      .createQueryBuilder(OrganizationMember, "member")
      .leftJoinAndSelect("member.organization", "organization")
      .leftJoinAndSelect("member.role", "memberRole")
      .where("member.userId = :userId", { userId })
      .orderBy("member.joinedAt", "DESC")
      .getMany();
  }

  async findPlatformStats() {
    const [totalUsers, totalAdmins] = await Promise.all([
      this.count(),
      this.count({ where: { role: PlatformRole.ADMIN } }),
    ]);

    const orgStatusRows = await this.manager
      .createQueryBuilder(Organization, "org")
      .select("org.status", "status")
      .addSelect("COUNT(org.id)::int", "count")
      .groupBy("org.status")
      .getRawMany<{ status: string; count: string }>();

    const organizations = {
      active: 0,
      suspended: 0,
      inactive: 0,
    };
    for (const row of orgStatusRows) {
      const status = row.status as OrganizationStatus;
      if (status in organizations) {
        organizations[status] = Number(row.count);
      }
    }
    const totalOrganizations = Object.values(organizations).reduce((sum, value) => sum + value, 0);

    const [recentUsers, recentOrganizations] = await Promise.all([
      this.createUserBaseQueryBuilder().orderBy("user.createdAt", "DESC").take(5).getMany(),
      this.createOrganizationBaseQueryBuilder().orderBy("org.createdAt", "DESC").take(5).getMany(),
    ]);

    return {
      users: { total: totalUsers, admins: totalAdmins },
      organizations: { total: totalOrganizations, ...organizations },
      recentUsers,
      recentOrganizations,
    };
  }
}
