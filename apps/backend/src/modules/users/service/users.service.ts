/// <reference types="multer" />
import { Inject, Injectable } from "@nestjs/common";
import type { UpdateUserDto } from "../dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import type { Repository } from "typeorm";
import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { R2Storage } from "../../../infrastructure/storage/r2/r2.storage";
import { normalizeEmail } from "../../../common/utils/email.util";

@Injectable()
export class UsersService {
  private readonly cacheTTL = 900_000; // Cache TTL in milliseconds (15 minutes)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly storage: R2Storage,
  ) {}

  async findOne(id: number) {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) return cachedUser;
    const user = await this.userRepository.findOneBy({ id });
    if (user) await this.cacheManager.set(cacheKey, user, this.cacheTTL);
    return user;
  }

  async findOneByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const cacheKey = `user:email:${normalizedEmail}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) return cachedUser;
    const user = await this.userRepository.findOneBy({ normalizedEmail });
    if (user) await this.cacheManager.set(cacheKey, user, this.cacheTTL);
    return user;
  }

  async update(user: User, updateUserDto: UpdateUserDto, avatar?: Express.Multer.File) {
    Object.assign(user, updateUserDto);
    if (user.email) {
      user.normalizedEmail = normalizeEmail(user.email);
    }
    if (avatar) {
      user.avatar = await this.storage
        .uploadPublic({
          key: `users-avatars/${user.id}`,
          buffer: avatar.buffer,
          contentType: avatar.mimetype,
          contentLength: avatar.size,
        })
        .then((res) => res.url);
    }
    const result = await this.userRepository.save(user);
    await this.cacheManager.del(`user:${user.id}`);
    if (user.normalizedEmail) {
      await this.cacheManager.del(`user:email:${user.normalizedEmail}`);
    }
    if (user.email) {
      await this.cacheManager.del(`user:email:${user.email}`);
    }
    return result;
  }
}
