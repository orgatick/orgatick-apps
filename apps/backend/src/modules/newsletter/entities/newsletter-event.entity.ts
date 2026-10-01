import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { NewsletterEventType } from "@orgatick/contracts";

/**
 * Append-only engagement log: opens, clicks, bounces and complaints.
 *
 * Kept separate from the recipient row so repeated opens are countable and so the
 * top-links report can be produced without scanning HTML.
 */
@Entity({ name: "newsletter_events", schema: "newsletter" })
@Index("IDX_newsletter_events_newsletter_id_type", ["newsletterId", "type"])
@Index("IDX_newsletter_events_recipient_id_created_at", ["recipientId", "createdAt"])
export class NewsletterEvent {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "newsletter_id", type: "bigint" })
  newsletterId!: bigint;

  @Column({ name: "recipient_id", type: "bigint", nullable: true })
  recipientId?: bigint | null;

  @Column({ name: "subscriber_id", type: "bigint", nullable: true })
  subscriberId?: bigint | null;

  @Column({ type: "varchar", length: 20 })
  type!: NewsletterEventType;

  /** Destination for click events. */
  @Column({ type: "text", nullable: true })
  url?: string | null;

  @Column({ name: "ip_address", type: "varchar", length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ name: "user_agent", type: "varchar", length: 512, nullable: true })
  userAgent?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
