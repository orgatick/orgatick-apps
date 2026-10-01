import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum VerificationType {
  EMAIL = "email",
  PHONE = "phone",
}

export enum VerificationPurpose {
  SIGNUP = "signup",
  CHANGE = "change",
}

@Entity({ name: "user_verifications", schema: "identity" })
export class UserVerification {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;
  @Column({ type: "bigint" })
  userId!: number;

  @Column({ type: "varchar", length: 20 })
  type!: VerificationType;

  @Column({ type: "varchar", length: 30 })
  purpose!: VerificationPurpose;

  @Column({ type: "varchar", length: 320 })
  target!: string;

  @Column({ type: "varchar", length: 255 })
  tokenHash!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: "integer", default: 0 })
  attempts!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
