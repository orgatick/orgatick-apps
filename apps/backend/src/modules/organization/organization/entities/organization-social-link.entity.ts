import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import type { OrganizationSocialPlatform } from "../enums/organization-social-platform.enum";
import { Organization } from "./organization.entity";

@Entity({ name: "organization_social_links", schema: "organization" })
@Unique("idx_organization_social_links_org_id_platform", ["organizationId", "platform"])
@Index("IDX_organization_social_links_org_id", ["organizationId"])
export class OrganizationSocialLink {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    type: "varchar",
    length: 50,
  })
  platform!: OrganizationSocialPlatform;

  @Column({ type: "varchar", length: 500 })
  url!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.socialLinks,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
