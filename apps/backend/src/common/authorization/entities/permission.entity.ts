import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermission } from "./role-permission.entity";

@Entity({ name: "permissions", schema: "authorization" })
export class Permission {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Index("IDX_permissions_key", { unique: true })
  @Column({ type: "varchar", length: 150, unique: true })
  key!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 50 })
  resource!: string;

  @Column({ type: "varchar", length: 50 })
  action!: string;

  @Column({ type: "varchar", length: 30 })
  scope!: string;

  @Column({ type: "varchar", length: 50 })
  category!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions?: RolePermission[];
}
