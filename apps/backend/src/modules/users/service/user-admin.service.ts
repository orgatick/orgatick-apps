import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PlatformRole } from "../enums/platform-role.enums";
import { UserAdminRepository } from "../repositories/user-admin.repository";
import type { AdminUserQueryDto } from "../dto/user-admin.dto";

@Injectable()
export class UserAdminService {
  constructor(private readonly userAdminRepository: UserAdminRepository) {}

  async findAllUsers(query: AdminUserQueryDto) {
    const [items, total] = await this.userAdminRepository.findPaginatedUsers(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      items,
      meta: { total, page: query.page, limit: query.limit, totalPages },
    };
  }

  async findUser(id: bigint) {
    const user = await this.userAdminRepository.findUserDetail(id);
    if (!user) throw new NotFoundException("User not found");
    const memberships = await this.userAdminRepository.findUserMemberships(id);
    return { user, memberships };
  }

  async updateUserRole(id: bigint, role: PlatformRole, requestingUserId: bigint) {
    if (id === requestingUserId) {
      throw new BadRequestException("You cannot change your own platform role");
    }

    const user = await this.userAdminRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");

    if (role === PlatformRole.USER) {
      const adminCount = await this.userAdminRepository.count({ where: { role: PlatformRole.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException("Cannot demote the last platform admin");
      }
    }

    user.role = role;
    return await this.userAdminRepository.save(user);
  }
}
