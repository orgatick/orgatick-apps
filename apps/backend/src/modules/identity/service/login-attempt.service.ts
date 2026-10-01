import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  type FindOptionsOrder,
  type FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  type Repository,
} from "typeorm";
import { UserLoginAttempt, type LoginAttemptStatus } from "../entities/user-login-attempt.entity";
import type { LoginAttemptQueryDto } from "../dto/login-attempt-query.dto";

export interface RecordLoginAttemptDto {
  userId?: number | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: LoginAttemptStatus;
  failureReason?: string | null;
}

@Injectable()
export class LoginAttemptService {
  constructor(
    @InjectRepository(UserLoginAttempt)
    private readonly loginAttemptRepository: Repository<UserLoginAttempt>,
  ) {}

  /** * Records a user login attempt (both success and failure). */
  async recordAttempt(dto: RecordLoginAttemptDto): Promise<UserLoginAttempt> {
    const attempt = this.loginAttemptRepository.create({
      userId: dto.userId ? dto.userId : null,
      email: dto.email,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      status: dto.status,
      failureReason: dto.failureReason ?? null,
      attemptedAt: new Date(),
    });
    return await this.loginAttemptRepository.save(attempt);
  }

  /** *Fetches login attempt history for a specific user ID. */
  async findAttemptsByUserId(userId: number, query: LoginAttemptQueryDto): Promise<UserLoginAttempt[]> {
    const { page = 1, limit = 10, startDate, endDate, sortOrder = "DESC" } = query;
    const order: FindOptionsOrder<UserLoginAttempt> = { attemptedAt: sortOrder };
    const where: FindOptionsWhere<UserLoginAttempt> = { userId };
    if (startDate && endDate) where.attemptedAt = Between(startDate, endDate);
    else if (startDate) where.attemptedAt = MoreThanOrEqual(startDate);
    else if (endDate) where.attemptedAt = LessThanOrEqual(endDate);
    return await this.loginAttemptRepository.find({ where, order, take: limit, skip: (page - 1) * limit });
  }

  /** * Fetches login attempt history for a specific email address. */
  async findAttemptsByEmail(email: string, limit = 10): Promise<UserLoginAttempt[]> {
    return await this.loginAttemptRepository.find({
      where: { email },
      order: { attemptedAt: "DESC" },
      take: limit,
    });
  }
}
