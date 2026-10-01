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
import { NewsletterSubscriberSource, NewsletterSubscriberStatus } from "@orgatick/contracts";
import type { NewsletterPreferencesDto } from "@orgatick/contracts";
import { NewsletterList } from "./newsletter-list.entity";

/**
 * One address on one list. Confirmation and unsubscribe tokens are stored hashed,
 * never in plaintext, so a database leak cannot be replayed against subscribers.
 */
@Entity({ name: "newsletter_subscribers", schema: "newsletter" })
@Index("IDX_newsletter_subscribers_list_id_email_normalized", ["listId", "emailNormalized"], { unique: true })
@Index("IDX_newsletter_subscribers_status", ["status"])
@Index("IDX_newsletter_subscribers_confirmation_token_hash", ["confirmationTokenHash"])
@Index("IDX_newsletter_subscribers_unsubscribe_token_hash", ["unsubscribeTokenHash"])
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ name: "list_id", type: "bigint" })
  listId!: bigint;

  /** Address exactly as the subscriber typed it, used in the greeting. */
  @Column({ type: "varchar", length: 320 })
  email!: string;

  /** Lowercased / de-dotted address used for lookups and uniqueness. */
  @Column({ name: "email_normalized", type: "varchar", length: 320 })
  emailNormalized!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  name?: string | null;

  @Column({ type: "varchar", length: 30, default: NewsletterSubscriberStatus.PENDING })
  status!: NewsletterSubscriberStatus;

  @Column({ type: "varchar", length: 30, default: NewsletterSubscriberSource.FOOTER })
  source!: NewsletterSubscriberSource;

  @Column({ name: "confirmation_token_hash", type: "varchar", length: 128, nullable: true })
  confirmationTokenHash?: string | null;

  @Column({ name: "confirmation_expires_at", type: "timestamp", nullable: true })
  confirmationExpiresAt?: Date | null;

  @Column({ name: "unsubscribe_token_hash", type: "varchar", length: 128 })
  unsubscribeTokenHash!: string;

  @Column({ type: "jsonb", default: () => '\'{"categories":[],"marketing":true}\'' })
  preferences!: NewsletterPreferencesDto;

  @Column({ type: "jsonb", default: () => "'{}'" })
  attributes!: Record<string, string>;

  @Column({ name: "user_id", type: "bigint", nullable: true })
  userId?: bigint | null;

  @Column({ name: "organization_id", type: "bigint", nullable: true })
  organizationId?: bigint | null;

  @Column({ name: "ip_address", type: "varchar", length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ name: "user_agent", type: "varchar", length: 512, nullable: true })
  userAgent?: string | null;

  @Column({ name: "subscribed_at", type: "timestamp", nullable: true })
  subscribedAt?: Date | null;

  @Column({ name: "confirmed_at", type: "timestamp", nullable: true })
  confirmedAt?: Date | null;

  @Column({ name: "unsubscribed_at", type: "timestamp", nullable: true })
  unsubscribedAt?: Date | null;

  @Column({ name: "bounced_at", type: "timestamp", nullable: true })
  bouncedAt?: Date | null;

  @Column({ name: "complained_at", type: "timestamp", nullable: true })
  complainedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => NewsletterList,
    (list) => list.subscribers,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "list_id" })
  list!: NewsletterList;
}
