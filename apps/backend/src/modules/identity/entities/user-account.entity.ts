import { User } from "@/modules/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum AuthProvider {
  PASSWORD = "password",
  GOOGLE = "google",
  APPLE = "apple",
}

@Entity({ name: "user_accounts", schema: "identity" })
export class UserAccount {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: number;

  @Column({ type: "bigint" })
  userId!: number;

  @Column({ type: "varchar", length: 50 })
  provider!: AuthProvider;

  @Column({ type: "varchar", length: 255, nullable: true })
  providerAccountId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => User,
    (user) => user.userAccount,
  )
  @JoinColumn()
  user!: User;
}
