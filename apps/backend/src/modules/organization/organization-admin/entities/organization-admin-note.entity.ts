import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "organization_admin_notes", schema: "organization" })
@Index("IDX_oan_organization", ["organizationId"])
export class OrganizationAdminNote {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "text" })
  note!: string;

  @Column({ name: "created_by", type: "bigint", nullable: true })
  createdBy?: bigint | null;

  @Column({ name: "actor_name", type: "varchar", length: 255, nullable: true })
  actorName?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
