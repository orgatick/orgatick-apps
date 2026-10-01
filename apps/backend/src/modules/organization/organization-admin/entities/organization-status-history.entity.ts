import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "organization_status_history", schema: "organization" })
@Index("IDX_osh_organization", ["organizationId"])
export class OrganizationStatusHistory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "from_status", type: "varchar", length: 30, nullable: true })
  fromStatus?: string | null;

  @Column({ name: "to_status", type: "varchar", length: 30, nullable: true })
  toStatus?: string | null;

  @Column({ name: "change_type", type: "varchar", length: 50 })
  changeType!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  reason?: string | null;

  @Column({ name: "changed_by", type: "bigint", nullable: true })
  changedBy?: bigint | null;

  @Column({ name: "actor_name", type: "varchar", length: 255, nullable: true })
  actorName?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
