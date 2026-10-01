import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Organization } from "../../organization/organization/entities/organization.entity";
import type { OrganizationStatus } from "../../organization/organization/enums/organization-status.enum";
import { PlatformRole } from "../../users/enums/platform-role.enums";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class DashboardRepository {
  constructor(private readonly dataSource: DataSource) {}

  private createUserBaseQueryBuilder() {
    return this.dataSource
      .createQueryBuilder(User, "user")
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

  private createOrganizationBaseQueryBuilder() {
    return this.dataSource
      .createQueryBuilder(Organization, "org")
      .leftJoinAndSelect("org.category", "category")
      .leftJoinAndSelect("org.subCategory", "subCategory")
      .leftJoinAndSelect("org.address", "address")
      .leftJoinAndSelect("org.creator", "creator")
      .leftJoinAndSelect("org.stats", "stats");
  }

  async findPlatformStats() {
    const [totalUsers, totalAdmins] = await Promise.all([
      this.dataSource.manager.count(User),
      this.dataSource.manager.count(User, { where: { role: PlatformRole.ADMIN } }),
    ]);

    const orgStatusRows = await this.dataSource
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
