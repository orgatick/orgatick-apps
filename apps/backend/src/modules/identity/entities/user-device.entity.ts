import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_devices", schema: "identity" })
export class UserDevice {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ name: "device_identifier", type: "varchar", length: 255 })
  deviceIdentifier!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  name!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  platform!: string | null;

  @Column({ name: "last_seen_at", type: "timestamp", nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
