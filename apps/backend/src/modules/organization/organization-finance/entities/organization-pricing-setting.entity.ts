import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_pricing_settings", schema: "organization" })
export class OrganizationPricingSetting {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    name: "paid_events_enabled",
    type: "boolean",
    default: false,
  })
  paidEventsEnabled!: boolean;

  @Column({
    name: "require_bank_details",
    type: "boolean",
    default: true,
  })
  requireBankDetails!: boolean;

  @Column({
    name: "disabled_reason",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  disabledReason?: string | null;

  @Column({
    name: "updated_by",
    type: "bigint",
    nullable: true,
  })
  updatedBy?: bigint | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.pricingSetting,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
