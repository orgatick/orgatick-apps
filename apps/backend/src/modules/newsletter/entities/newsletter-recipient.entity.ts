import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NewsletterRecipientStatus } from "@orgatick/contracts";
import { Newsletter } from "./newsletter.entity";
import { NewsletterSubscriber } from "./newsletter-subscriber.entity";

/**
 * One queued delivery of a campaign to one address.
 *
 * The unique (newsletter_id, email_normalized) index is what makes the queue build
 * idempotent: re-running a dispatch can never duplicate a recipient.
 */
@Entity({ name: "newsletter_recipients", schema: "newsletter" })
@Index("IDX_newsletter_recipients_newsletter_id_email_normalized", ["newsletterId", "emailNormalized"], {
  unique: true,
})
@Index("IDX_newsletter_recipients_newsletter_id_status", ["newsletterId", "status"])
export class NewsletterRecipient {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "newsletter_id", type: "bigint" })
  newsletterId!: bigint;

  @Column({ name: "subscriber_id", type: "bigint", nullable: true })
  subscriberId?: bigint | null;

  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ name: "email_normalized", type: "varchar", length: 320 })
  emailNormalized!: string;

  @Column({ type: "varchar", length: 30, default: NewsletterRecipientStatus.QUEUED })
  status!: NewsletterRecipientStatus;

  @Column({ name: "provider_message_id", type: "varchar", length: 255, nullable: true })
  providerMessageId?: string | null;

  @Column({ name: "queued_at", type: "timestamp", nullable: true })
  queuedAt?: Date | null;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt?: Date | null;

  @Column({ name: "delivered_at", type: "timestamp", nullable: true })
  deliveredAt?: Date | null;

  @Column({ name: "opened_at", type: "timestamp", nullable: true })
  openedAt?: Date | null;

  @Column({ name: "clicked_at", type: "timestamp", nullable: true })
  clickedAt?: Date | null;

  @Column({ name: "unsubscribed_at", type: "timestamp", nullable: true })
  unsubscribedAt?: Date | null;

  @Column({ name: "bounced_at", type: "timestamp", nullable: true })
  bouncedAt?: Date | null;

  @Column({ name: "open_count", type: "integer", default: 0 })
  openCount!: number;

  @Column({ name: "click_count", type: "integer", default: 0 })
  clickCount!: number;

  @Column({ name: "attempt_count", type: "integer", default: 0 })
  attemptCount!: number;

  @Column({ name: "last_error", type: "text", nullable: true })
  lastError?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => Newsletter, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "newsletter_id" })
  newsletter!: Newsletter;

  @ManyToOne(() => NewsletterSubscriber, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "subscriber_id" })
  subscriber?: NewsletterSubscriber | null;
}
