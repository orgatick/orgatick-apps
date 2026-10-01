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
import { NewsletterStatus, type NewsletterAudienceDto, type NewsletterContent } from "@orgatick/contracts";
import { User } from "../../users/entities/user.entity";
import { NewsletterList } from "./newsletter-list.entity";
import { NewsletterTemplate } from "./newsletter-template.entity";

/**
 * A campaign: the draft/scheduled/sent unit an admin manages.
 *
 * Denormalised delivery counters are maintained by the dispatcher so the admin list
 * never has to aggregate the recipient table.
 */
@Entity({ name: "newsletters", schema: "newsletter" })
@Index("IDX_newsletters_status", ["status"])
@Index("IDX_newsletters_status_scheduled_at", ["status", "scheduledAt"])
@Index("IDX_newsletters_list_id", ["listId"])
export class Newsletter {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ name: "list_id", type: "bigint" })
  listId!: bigint;

  @Column({ name: "template_id", type: "bigint", nullable: true })
  templateId?: bigint | null;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 200 })
  subject!: string;

  @Column({ name: "preview_text", type: "varchar", length: 300, nullable: true })
  previewText?: string | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  content!: NewsletterContent;

  @Column({ name: "html_override", type: "text", nullable: true })
  htmlOverride?: string | null;

  @Column({ name: "text_override", type: "text", nullable: true })
  textOverride?: string | null;

  @Column({ type: "varchar", length: 30, default: NewsletterStatus.DRAFT })
  status!: NewsletterStatus;

  @Column({ type: "jsonb", default: () => "'{}'" })
  audience!: NewsletterAudienceDto;

  @Column({ name: "from_name", type: "varchar", length: 120 })
  fromName!: string;

  @Column({ name: "from_email", type: "varchar", length: 320 })
  fromEmail!: string;

  @Column({ name: "reply_to", type: "varchar", length: 320, nullable: true })
  replyTo?: string | null;

  @Column({ name: "scheduled_at", type: "timestamp", nullable: true })
  scheduledAt?: Date | null;

  @Column({ name: "started_at", type: "timestamp", nullable: true })
  startedAt?: Date | null;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt?: Date | null;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt?: Date | null;

  @Column({ name: "cancelled_at", type: "timestamp", nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage?: string | null;

  @Column({ name: "recipient_count", type: "integer", default: 0 })
  recipientCount!: number;

  @Column({ name: "delivered_count", type: "integer", default: 0 })
  deliveredCount!: number;

  @Column({ name: "opened_count", type: "integer", default: 0 })
  openedCount!: number;

  @Column({ name: "clicked_count", type: "integer", default: 0 })
  clickedCount!: number;

  @Column({ name: "bounced_count", type: "integer", default: 0 })
  bouncedCount!: number;

  @Column({ name: "complained_count", type: "integer", default: 0 })
  complainedCount!: number;

  @Column({ name: "unsubscribed_count", type: "integer", default: 0 })
  unsubscribedCount!: number;

  @Column({ name: "failed_count", type: "integer", default: 0 })
  failedCount!: number;

  @Column({ name: "created_by", type: "bigint", nullable: true })
  createdBy?: bigint | null;

  @Column({ name: "updated_by", type: "bigint", nullable: true })
  updatedBy?: bigint | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => NewsletterList,
    (list) => list.newsletters,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "list_id" })
  list!: NewsletterList;

  @ManyToOne(() => NewsletterTemplate, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "template_id" })
  template?: NewsletterTemplate | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  creator?: User | null;
}
