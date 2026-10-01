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
import { User } from "../../../users/entities/user.entity";
import { Organization } from "../../organization/entities/organization.entity";
import type { OrganizationMemberRole } from "../../organization-member/enums/organization-member-role.enum";
import { OrganizationInvitationStatus } from "../enums/organization-invitation-status.enum";

@Entity({ name: "organization_invitations", schema: "organization" })
@Index("idx_organization_invitations_organization_id_email", ["organizationId", "email"])
@Index("idx_organization_invitations_organization_id_status", ["organizationId", "status"])
@Index("IDX_organization_invitations_token_hash", ["tokenHash"], { unique: true })
@Index("IDX_organization_invitations_invited_by", ["invitedBy"])
export class OrganizationInvitation {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({
    type: "varchar",
    length: 30,
  })
  role!: OrganizationMemberRole;

  @Column({ name: "invited_by", type: "bigint" })
  invitedBy!: bigint;

  @Column({ name: "token_hash", type: "varchar", length: 255, unique: true })
  tokenHash!: string;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationInvitationStatus.PENDING,
  })
  status!: OrganizationInvitationStatus;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt!: Date;

  @Column({ name: "accepted_at", type: "timestamp", nullable: true })
  acceptedAt?: Date | null;

  @Column({ name: "rejected_at", type: "timestamp", nullable: true })
  rejectedAt?: Date | null;

  @Column({ name: "cancelled_at", type: "timestamp", nullable: true })
  cancelledAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.invitations,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "invited_by" })
  inviter!: User;
}
