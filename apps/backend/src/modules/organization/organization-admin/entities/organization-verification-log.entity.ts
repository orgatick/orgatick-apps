import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "organization_verification_logs", schema: "organization" })
@Index("IDX_ovl_organization", ["organizationId"])
export class OrganizationVerificationLog {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "varchar", length: 50 })
  action!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  note?: string | null;

  @Column({ name: "changed_by", type: "bigint", nullable: true })
  changedBy?: bigint | null;

  @Column({ name: "actor_name", type: "varchar", length: 255, nullable: true })
  actorName?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
