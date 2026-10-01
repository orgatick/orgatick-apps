import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum LoginAttemptStatus {
  SUCCESS = "success",
  FAILED = "failed",
}

@Entity({ name: "user_login_attempts", schema: "identity" })
export class UserLoginAttempt {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "bigint", nullable: true })
  userId!: number | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

  @Column({ type: "varchar", length: 20 })
  status!: LoginAttemptStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  failureReason!: string | null;

  @Column({ type: "timestamp" })
  attemptedAt!: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
