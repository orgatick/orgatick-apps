import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { Role } from "./role.entity";

@Entity({ name: "role_permissions", schema: "authorization" })
export class RolePermission {
  @PrimaryColumn({ name: "role_id", type: "bigint" })
  roleId!: bigint;

  @PrimaryColumn({ name: "permission_id", type: "bigint" })
  permissionId!: bigint;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(
    () => Role,
    (role) => role.rolePermissions,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "role_id" })
  role?: Role;

  @ManyToOne(() => Permission, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "permission_id" })
  permission?: Permission;
}
