import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { UserGender } from "../enums/gender.enums";
import { PlatformRole } from "../enums/platform-role.enums";

export abstract class UserBase {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ name: "normalized_email", type: "varchar", length: 320 })
  normalizedEmail!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender!: UserGender | null;

  @Column({ name: "phone_number", type: "varchar", length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: "varchar", length: 1000, nullable: true })
  avatar!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ type: "varchar", length: 20, default: PlatformRole.USER })
  role!: PlatformRole;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
