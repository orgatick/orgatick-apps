import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_passkeys", schema: "identity" })
export class UserPasskey {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ name: "credential_id", type: "varchar", length: 1024 })
  credentialId!: string;

  @Column({ name: "public_key", type: "text" })
  publicKey!: string;

  @Column({ type: "bigint", default: 0 })
  counter!: string;

  @Column({ name: "device_type", type: "varchar", length: 50, nullable: true })
  deviceType!: string | null;

  @Column({ name: "backed_up", type: "boolean", default: false })
  backedUp!: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  name!: string | null;

  @Column({ name: "last_used_at", type: "timestamp", nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
