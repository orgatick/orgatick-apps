import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import type { SignupDTO } from "@orgatick/contracts";
import { User } from "@/modules/users/entities/user.entity";
import { AuthProvider, UserAccount } from "@/modules/identity/entities/user-account.entity";
import { UserSecurity } from "@/modules/identity/entities/user-security.entity";
import { PasswordService } from "./password.service";
import { EmailVerificationService } from "./email-verification.service";
import { normalizeEmail } from "@/common/utils/email.util";

@Injectable()
export class UserRegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
    private readonly passwordService: PasswordService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Transactional()
  async registerUser(registerUserDto: SignupDTO) {
    const normalizedEmail = normalizeEmail(registerUserDto.email);
    const existingUser = await this.userRepository.findOne({ where: { normalizedEmail } });
    if (existingUser) throw new ConflictException("User already exists");
    const user = await this.createUser(registerUserDto, normalizedEmail, AuthProvider.PASSWORD);
    const token = await this.emailVerificationService.createAndSendVerificationToken(user.id, user.email, user.name);

    return {
      user,
      token,
      message: "Registration successful. Please check your email for the verification link.",
    };
  }

  @Transactional()
  private async createUser(registerUserDto: SignupDTO, normalizedEmail: string, provider: AuthProvider) {
    const user = this.userRepository.create({
      ...registerUserDto,
      normalizedEmail,
    });
    await this.userRepository.save(user);
    const passwordHash = await this.passwordService.hashPassword(registerUserDto.password);
    await this.userAccountRepository.save({ userId: user.id, provider, passwordHash });
    await this.userSecurityRepository.save({ userId: user.id, isVerified: false });
    return user;
  }
}
