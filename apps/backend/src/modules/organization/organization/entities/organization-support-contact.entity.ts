import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "./organization.entity";

@Entity({ name: "organization_support_contacts", schema: "organization" })
@Index("IDX_organization_support_contacts_org_id", ["organizationId"])
export class OrganizationSupportContact {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 320, nullable: true })
  email?: string | null;

  @Column({ name: "phone_number", type: "varchar", length: 30, nullable: true })
  phoneNumber?: string | null;

  @Column({ name: "is_primary", type: "boolean", default: false })
  isPrimary!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.supportContacts,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
