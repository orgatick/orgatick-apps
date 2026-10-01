import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateNewsletterTables1791300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("newsletter", true);

    await this.createLists(queryRunner);
    await this.createSubscribers(queryRunner);
    await this.createTemplates(queryRunner);
    await this.createNewsletters(queryRunner);
    await this.createRecipients(queryRunner);
    await this.createEvents(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "newsletter_events", schema: "newsletter" }), true);
    await queryRunner.dropTable(new Table({ name: "newsletter_recipients", schema: "newsletter" }), true);
    await queryRunner.dropTable(new Table({ name: "newsletters", schema: "newsletter" }), true);
    await queryRunner.dropTable(new Table({ name: "newsletter_templates", schema: "newsletter" }), true);
    await queryRunner.dropTable(new Table({ name: "newsletter_subscribers", schema: "newsletter" }), true);
    await queryRunner.dropTable(new Table({ name: "newsletter_lists", schema: "newsletter" }), true);
    await queryRunner.dropSchema("newsletter", true);
  }

  private async createLists(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletter_lists",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "uuid", type: "uuid", isUnique: true, default: "gen_random_uuid()" },
          { name: "name", type: "varchar", length: "120", isNullable: false },
          { name: "slug", type: "varchar", length: "80", isUnique: true, isNullable: false },
          { name: "description", type: "varchar", length: "500", isNullable: true },
          { name: "scope", type: "varchar", length: "30", default: "'platform'", isNullable: false },
          { name: "organization_id", type: "bigint", isNullable: true },
          { name: "is_default", type: "boolean", default: false, isNullable: false },
          { name: "is_active", type: "boolean", default: true, isNullable: false },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletter_lists", schema: "newsletter" }), [
      new TableIndex({ name: "IDX_newsletter_lists_slug", columnNames: ["slug"], isUnique: true }),
      new TableIndex({ name: "IDX_newsletter_lists_organization_id", columnNames: ["organization_id"] }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletter_lists", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletter_lists_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    // Every deployment needs a default list so public signups always resolve.
    await queryRunner.query(
      `INSERT INTO "newsletter"."newsletter_lists" (name, slug, description, scope, is_default, is_active)
       VALUES ('Orgatick Newsletter', 'orgatick-newsletter', 'Default platform newsletter', 'platform', true, true)`,
    );
  }

  private async createSubscribers(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletter_subscribers",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "uuid", type: "uuid", isUnique: true, default: "gen_random_uuid()" },
          { name: "list_id", type: "bigint", isNullable: false },
          { name: "email", type: "varchar", length: "320", isNullable: false },
          { name: "email_normalized", type: "varchar", length: "320", isNullable: false },
          { name: "name", type: "varchar", length: "120", isNullable: true },
          { name: "status", type: "varchar", length: "30", default: "'pending'", isNullable: false },
          { name: "source", type: "varchar", length: "30", default: "'footer'", isNullable: false },
          { name: "confirmation_token_hash", type: "varchar", length: "128", isNullable: true },
          { name: "confirmation_expires_at", type: "timestamp", isNullable: true },
          { name: "unsubscribe_token_hash", type: "varchar", length: "128", isNullable: false },
          {
            name: "preferences",
            type: "jsonb",
            default: `'{"categories":[],"marketing":true}'`,
            isNullable: false,
          },
          { name: "attributes", type: "jsonb", default: `'{}'`, isNullable: false },
          { name: "user_id", type: "bigint", isNullable: true },
          { name: "organization_id", type: "bigint", isNullable: true },
          { name: "ip_address", type: "varchar", length: "64", isNullable: true },
          { name: "user_agent", type: "varchar", length: "512", isNullable: true },
          { name: "subscribed_at", type: "timestamp", isNullable: true },
          { name: "confirmed_at", type: "timestamp", isNullable: true },
          { name: "unsubscribed_at", type: "timestamp", isNullable: true },
          { name: "bounced_at", type: "timestamp", isNullable: true },
          { name: "complained_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletter_subscribers", schema: "newsletter" }), [
      new TableIndex({
        name: "IDX_newsletter_subscribers_list_id_email_normalized",
        columnNames: ["list_id", "email_normalized"],
        isUnique: true,
      }),
      new TableIndex({ name: "IDX_newsletter_subscribers_status", columnNames: ["status"] }),
      new TableIndex({
        name: "IDX_newsletter_subscribers_confirmation_token_hash",
        columnNames: ["confirmation_token_hash"],
      }),
      new TableIndex({
        name: "IDX_newsletter_subscribers_unsubscribe_token_hash",
        columnNames: ["unsubscribe_token_hash"],
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletter_subscribers", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletter_subscribers_list_id",
        columnNames: ["list_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_lists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_subscribers_user_id",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_subscribers_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  private async createTemplates(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletter_templates",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "uuid", type: "uuid", isUnique: true, default: "gen_random_uuid()" },
          { name: "name", type: "varchar", length: "120", isNullable: false },
          { name: "description", type: "varchar", length: "500", isNullable: true },
          { name: "category", type: "varchar", length: "64", isNullable: true },
          { name: "subject", type: "varchar", length: "200", isNullable: false },
          { name: "preview_text", type: "varchar", length: "300", isNullable: true },
          { name: "content", type: "jsonb", default: `'[]'`, isNullable: false },
          { name: "html_override", type: "text", isNullable: true },
          { name: "status", type: "varchar", length: "20", default: "'draft'", isNullable: false },
          { name: "created_by", type: "bigint", isNullable: true },
          { name: "updated_by", type: "bigint", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletter_templates", schema: "newsletter" }), [
      new TableIndex({ name: "IDX_newsletter_templates_status", columnNames: ["status"] }),
      new TableIndex({ name: "IDX_newsletter_templates_category", columnNames: ["category"] }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletter_templates", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletter_templates_created_by",
        columnNames: ["created_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_templates_updated_by",
        columnNames: ["updated_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  private async createNewsletters(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletters",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "uuid", type: "uuid", isUnique: true, default: "gen_random_uuid()" },
          { name: "list_id", type: "bigint", isNullable: false },
          { name: "template_id", type: "bigint", isNullable: true },
          { name: "name", type: "varchar", length: "200", isNullable: false },
          { name: "subject", type: "varchar", length: "200", isNullable: false },
          { name: "preview_text", type: "varchar", length: "300", isNullable: true },
          { name: "content", type: "jsonb", default: `'[]'`, isNullable: false },
          { name: "html_override", type: "text", isNullable: true },
          { name: "text_override", type: "text", isNullable: true },
          { name: "status", type: "varchar", length: "30", default: "'draft'", isNullable: false },
          { name: "audience", type: "jsonb", default: `'{}'`, isNullable: false },
          { name: "from_name", type: "varchar", length: "120", isNullable: false },
          { name: "from_email", type: "varchar", length: "320", isNullable: false },
          { name: "reply_to", type: "varchar", length: "320", isNullable: true },
          { name: "scheduled_at", type: "timestamp", isNullable: true },
          { name: "started_at", type: "timestamp", isNullable: true },
          { name: "sent_at", type: "timestamp", isNullable: true },
          { name: "completed_at", type: "timestamp", isNullable: true },
          { name: "cancelled_at", type: "timestamp", isNullable: true },
          { name: "error_message", type: "text", isNullable: true },
          { name: "recipient_count", type: "integer", default: 0, isNullable: false },
          { name: "delivered_count", type: "integer", default: 0, isNullable: false },
          { name: "opened_count", type: "integer", default: 0, isNullable: false },
          { name: "clicked_count", type: "integer", default: 0, isNullable: false },
          { name: "bounced_count", type: "integer", default: 0, isNullable: false },
          { name: "complained_count", type: "integer", default: 0, isNullable: false },
          { name: "unsubscribed_count", type: "integer", default: 0, isNullable: false },
          { name: "failed_count", type: "integer", default: 0, isNullable: false },
          { name: "created_by", type: "bigint", isNullable: true },
          { name: "updated_by", type: "bigint", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletters", schema: "newsletter" }), [
      new TableIndex({ name: "IDX_newsletters_status", columnNames: ["status"] }),
      new TableIndex({ name: "IDX_newsletters_status_scheduled_at", columnNames: ["status", "scheduled_at"] }),
      new TableIndex({ name: "IDX_newsletters_list_id", columnNames: ["list_id"] }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletters", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletters_list_id",
        columnNames: ["list_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_lists",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletters_template_id",
        columnNames: ["template_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_templates",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletters_created_by",
        columnNames: ["created_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletters_updated_by",
        columnNames: ["updated_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  private async createRecipients(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletter_recipients",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "newsletter_id", type: "bigint", isNullable: false },
          { name: "subscriber_id", type: "bigint", isNullable: true },
          { name: "email", type: "varchar", length: "320", isNullable: false },
          { name: "email_normalized", type: "varchar", length: "320", isNullable: false },
          { name: "status", type: "varchar", length: "30", default: "'queued'", isNullable: false },
          { name: "provider_message_id", type: "varchar", length: "255", isNullable: true },
          { name: "queued_at", type: "timestamp", isNullable: true },
          { name: "sent_at", type: "timestamp", isNullable: true },
          { name: "delivered_at", type: "timestamp", isNullable: true },
          { name: "opened_at", type: "timestamp", isNullable: true },
          { name: "clicked_at", type: "timestamp", isNullable: true },
          { name: "unsubscribed_at", type: "timestamp", isNullable: true },
          { name: "bounced_at", type: "timestamp", isNullable: true },
          { name: "open_count", type: "integer", default: 0, isNullable: false },
          { name: "click_count", type: "integer", default: 0, isNullable: false },
          { name: "attempt_count", type: "integer", default: 0, isNullable: false },
          { name: "last_error", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletter_recipients", schema: "newsletter" }), [
      new TableIndex({
        name: "IDX_newsletter_recipients_newsletter_id_email_normalized",
        columnNames: ["newsletter_id", "email_normalized"],
        isUnique: true,
      }),
      new TableIndex({
        name: "IDX_newsletter_recipients_newsletter_id_status",
        columnNames: ["newsletter_id", "status"],
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletter_recipients", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletter_recipients_newsletter_id",
        columnNames: ["newsletter_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletters",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_recipients_subscriber_id",
        columnNames: ["subscriber_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_subscribers",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  private async createEvents(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "newsletter_events",
        schema: "newsletter",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "newsletter_id", type: "bigint", isNullable: false },
          { name: "recipient_id", type: "bigint", isNullable: true },
          { name: "subscriber_id", type: "bigint", isNullable: true },
          { name: "type", type: "varchar", length: "20", isNullable: false },
          { name: "url", type: "text", isNullable: true },
          { name: "ip_address", type: "varchar", length: "64", isNullable: true },
          { name: "user_agent", type: "varchar", length: "512", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "newsletter_events", schema: "newsletter" }), [
      new TableIndex({ name: "IDX_newsletter_events_newsletter_id_type", columnNames: ["newsletter_id", "type"] }),
      new TableIndex({
        name: "IDX_newsletter_events_recipient_id_created_at",
        columnNames: ["recipient_id", "created_at"],
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "newsletter_events", schema: "newsletter" }), [
      new TableForeignKey({
        name: "FK_newsletter_events_newsletter_id",
        columnNames: ["newsletter_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletters",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_events_recipient_id",
        columnNames: ["recipient_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_recipients",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_newsletter_events_subscriber_id",
        columnNames: ["subscriber_id"],
        referencedSchema: "newsletter",
        referencedTableName: "newsletter_subscribers",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }
}
