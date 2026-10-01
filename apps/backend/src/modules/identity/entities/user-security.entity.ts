import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_security", schema: "identity" })
export class UserSecurity {
  @PrimaryColumn({ type: "bigint" })
  userId!: number;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastPasswordChangeAt!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  lastMfaAt!: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
