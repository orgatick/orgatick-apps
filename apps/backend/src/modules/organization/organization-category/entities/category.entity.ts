import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "organization_categories", schema: "organization" })
export class OrganizationCategory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Index("IDX_organization_categories_parent_id")
  @Column({ name: "parent_id", type: "bigint", nullable: true })
  parentId!: bigint | null;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Index("IDX_organization_categories_level")
  @Column({ type: "smallint", default: 1 })
  level!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Index("IDX_organization_categories_is_active")
  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Index("IDX_organization_categories_sort_order")
  @Column({ name: "sort_order", type: "smallint", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(
    () => OrganizationCategory,
    (organizationCategory) => organizationCategory.parent,
  )
  children?: OrganizationCategory[];

  @ManyToOne(
    () => OrganizationCategory,
    (organizationCategory) => organizationCategory.children,
    {
      nullable: true,
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "parent_id" })
  parent?: OrganizationCategory | null;
}
