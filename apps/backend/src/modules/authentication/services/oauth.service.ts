import { UserAccount } from "@/modules/identity/entities/user-account.entity";
import { UserSecurity } from "@/modules/identity/entities/user-security.entity";
import { User } from "@/modules/users/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { OAuthProfile } from "../types/oauth-google.types";
import { normalizeEmail } from "@/common/utils/email.util";

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
  ) {}

  async findOrCreateOAuthUser(profile: OAuthProfile): Promise<User> {
    let userAccount = await this.userAccountRepository.findOne({
      where: { provider: profile.provider, providerAccountId: profile.providerId },
    });

    let user: User | null = null;
    if (userAccount) user = await this.userRepository.findOne({ where: { id: userAccount.userId } });
    if (!user) {
      const normalizedEmail = normalizeEmail(profile.email);
      user = await this.userRepository.findOne({ where: { normalizedEmail } });
      if (user) {
        if (!userAccount) userAccount = await this.userAccountRepository.findOne({ where: { userId: user.id } });
        if (userAccount) {
          userAccount.provider = profile.provider;
          userAccount.providerAccountId = profile.providerId;
        } else {
          userAccount = this.userAccountRepository.create({
            userId: user.id,
            provider: profile.provider,
            providerAccountId: profile.providerId,
          });
        }
      } else {
        user = this.userRepository.create({
          name: profile.name,
          email: profile.email,
          normalizedEmail,
          avatar: profile.avatar ?? null,
        });
        await this.userRepository.save(user);
        userAccount = this.userAccountRepository.create({
          userId: user.id,
          provider: profile.provider,
          providerAccountId: profile.providerId,
        });
      }
    }

    if (profile.avatar && !user.avatar) {
      user.avatar = profile.avatar;
      await this.userRepository.save(user);
    }

    if (userAccount) {
      userAccount.lastLoginAt = new Date();
      await this.userAccountRepository.save(userAccount);
    }

    let userSecurity = await this.userSecurityRepository.findOne({ where: { userId: user.id } });
    if (!userSecurity) {
      userSecurity = this.userSecurityRepository.create({
        userId: user.id,
        isVerified: profile.emailVerified ?? true,
      });
      await this.userSecurityRepository.save(userSecurity);
    } else if (profile.emailVerified && !userSecurity.isVerified) {
      userSecurity.isVerified = true;
      await this.userSecurityRepository.save(userSecurity);
    }
    return user;
  }
}
