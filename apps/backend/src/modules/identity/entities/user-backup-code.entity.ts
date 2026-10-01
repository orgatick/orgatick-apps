import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_backup_codes", schema: "identity" })
export class UserBackupCode {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ name: "code_hash", type: "varchar", length: 255, select: false })
  codeHash!: string;

  @Column({ name: "used_at", type: "timestamp", nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
