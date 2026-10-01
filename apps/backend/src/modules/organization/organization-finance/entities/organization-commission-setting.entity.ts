import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_commission_settings", schema: "organization" })
export class OrganizationCommissionSetting {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    name: "commission_percentage",
    type: "numeric",
    precision: 5,
    scale: 2,
    default: 7.0,
  })
  commissionPercentage!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.commissionSetting,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
