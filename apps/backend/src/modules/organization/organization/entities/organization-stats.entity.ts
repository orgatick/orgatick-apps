import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./organization.entity";

@Entity({ name: "organization_stats", schema: "organization" })
export class OrganizationStats {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "total_events", type: "integer", default: 0 })
  totalEvents!: number;

  @Column({ name: "total_participants", type: "integer", default: 0 })
  totalParticipants!: number;

  @Column({ name: "total_paid_registrations", type: "integer", default: 0 })
  totalPaidRegistrations!: number;

  @Column({ name: "total_revenue", type: "numeric", precision: 15, scale: 2, default: 0.0 })
  totalRevenue!: number;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.stats,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
