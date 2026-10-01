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
import { NewsletterTemplateStatus, type NewsletterContent } from "@orgatick/contracts";
import { User } from "../../users/entities/user.entity";

/**
 * A reusable campaign shell: subject, preview text and block content, so a team can
 * standardise the recurring sends (monthly digest, event announcement, release notes).
 */
@Entity({ name: "newsletter_templates", schema: "newsletter" })
@Index("IDX_newsletter_templates_status", ["status"])
@Index("IDX_newsletter_templates_category", ["category"])
export class NewsletterTemplate {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  category?: string | null;

  @Column({ type: "varchar", length: 200 })
  subject!: string;

  @Column({ name: "preview_text", type: "varchar", length: 300, nullable: true })
  previewText?: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  content!: NewsletterContent;

  /** Set when a designer supplies a hand-built HTML body instead of blocks. */
  @Column({ name: "html_override", type: "text", nullable: true })
  htmlOverride?: string | null;

  @Column({ type: "varchar", length: 20, default: NewsletterTemplateStatus.DRAFT })
  status!: NewsletterTemplateStatus;

  @Column({ name: "created_by", type: "bigint", nullable: true })
  createdBy?: bigint | null;

  @Column({ name: "updated_by", type: "bigint", nullable: true })
  updatedBy?: bigint | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  creator?: User | null;
}
