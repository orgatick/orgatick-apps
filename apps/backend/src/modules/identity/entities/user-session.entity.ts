import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_sessions", schema: "identity" })
export class UserSession {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ name: "user_id", type: "bigint" })
  userId!: number;

  @Column({ type: "varchar", length: 255, select: false })
  sessionTokenHash!: string;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  revokedAt!: Date | null;

  @Column({ name: "revoked_reason", type: "varchar", length: 100, nullable: true })
  revokedReason!: string | null;

  @Column({ name: "rotation_counter", type: "integer", default: 1 })
  rotationCounter!: number;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt!: Date | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

  @Column({ type: "bigint", nullable: true })
  deviceId!: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
