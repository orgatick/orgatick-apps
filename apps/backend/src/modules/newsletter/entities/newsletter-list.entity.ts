import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NewsletterListScope } from "@orgatick/contracts";
import { Newsletter } from "./newsletter.entity";
import { NewsletterSubscriber } from "./newsletter-subscriber.entity";

/**
 * A mailing list that campaigns target. Platform-scope lists have no organization,
 * organization-scope lists belong to exactly one tenant.
 */
@Entity({ name: "newsletter_lists", schema: "newsletter" })
@Index("IDX_newsletter_lists_slug", ["slug"], { unique: true })
@Index("IDX_newsletter_lists_organization_id", ["organizationId"])
export class NewsletterList {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 80 })
  slug!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 30, default: NewsletterListScope.PLATFORM })
  scope!: NewsletterListScope;

  @Column({ name: "organization_id", type: "bigint", nullable: true })
  organizationId?: bigint | null;

  @Column({ name: "is_default", type: "boolean", default: false })
  isDefault!: boolean;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(
    () => NewsletterSubscriber,
    (subscriber) => subscriber.list,
  )
  subscribers!: NewsletterSubscriber[];

  @OneToMany(
    () => Newsletter,
    (newsletter) => newsletter.list,
  )
  newsletters!: Newsletter[];
}
