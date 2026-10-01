import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "organization_ownership_history", schema: "organization" })
@Index("IDX_ooh_organization", ["organizationId"])
export class OrganizationOwnershipHistory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "from_user_id", type: "bigint", nullable: true })
  fromUserId?: bigint | null;

  @Column({ name: "from_user_name", type: "varchar", length: 255, nullable: true })
  fromUserName?: string | null;

  @Column({ name: "to_user_id", type: "bigint", nullable: true })
  toUserId?: bigint | null;

  @Column({ name: "to_user_name", type: "varchar", length: 255, nullable: true })
  toUserName?: string | null;

  @Column({ type: "varchar", length: 50 })
  action!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  reason?: string | null;

  @Column({ name: "changed_by", type: "bigint", nullable: true })
  changedBy?: bigint | null;

  @Column({ name: "actor_name", type: "varchar", length: 255, nullable: true })
  actorName?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
