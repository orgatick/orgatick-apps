import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../../modules/organization/organization/entities/organization.entity";
import { Permission } from "./permission.entity";
import { RolePermission } from "./role-permission.entity";

@Entity({ name: "roles", schema: "authorization" })
@Index("IDX_roles_organization_id", ["organizationId"])
@Index("UQ_roles_organization_key", ["organizationId", "key"], { unique: true })
export class Role {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint", nullable: true })
  organizationId?: bigint | null;

  @Column({ type: "varchar", length: 100 })
  key!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization?: Organization | null;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions?: RolePermission[];

  @ManyToMany(() => Permission)
  @JoinTable({
    name: "role_permissions",
    schema: "authorization",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions?: Permission[];
}
