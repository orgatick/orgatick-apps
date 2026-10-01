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
import { Role } from "../../../../common/authorization/entities/role.entity";
import { User } from "../../../users/entities/user.entity";
import { Organization } from "../../organization/entities/organization.entity";
import { OrganizationMemberStatus } from "../enums/organization-member-status.enum";

@Entity({ name: "organization_members", schema: "organization" })
@Unique("idx_organization_members_organization_id_user_id", ["organizationId", "userId"])
@Index("IDX_organization_members_organization_id", ["organizationId"])
@Index("IDX_organization_members_user_id", ["userId"])
@Index("IDX_organization_members_role_id", ["roleId"])
@Index("IDX_organization_members_status", ["status"])
export class OrganizationMember {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "user_id", type: "bigint" })
  userId!: bigint;

  @Column({ name: "role_id", type: "bigint" })
  roleId!: bigint;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationMemberStatus.ACTIVE,
  })
  status!: OrganizationMemberStatus;

  @Column({ name: "joined_at", type: "timestamp", nullable: true })
  joinedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.members,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Role, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;
}
