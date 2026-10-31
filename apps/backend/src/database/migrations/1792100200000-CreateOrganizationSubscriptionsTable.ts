import { type MigrationInterface, type QueryRunner, Table, TableCheck, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationSubscriptionsTable1792100200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. organization_subscriptions
    await queryRunner.createTable(
      new Table({
        name: "organization_subscriptions",
        schema: "subscription",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "organization_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "plan_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "price_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "30",
            default: "'active'",
            isNullable: false,
          },
          {
            name: "billing_interval",
            type: "varchar",
            length: "20",
            default: "'none'",
            isNullable: false,
          },
          {
            name: "currency",
            type: "varchar",
            length: "3",
            default: "'INR'",
            isNullable: false,
          },
          {
            name: "current_period_start",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "current_period_end",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "trial_start",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "trial_end",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "grace_period_end",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "cancel_at_period_end",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "canceled_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "cancellation_reason",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "pending_plan_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "pending_price_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "pending_change_effective_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "auto_renew",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "version",
            type: "integer",
            default: 1,
            isNullable: false,
          },
          {
            name: "entitlements_version",
            type: "integer",
            default: 1,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "organization_subscriptions", schema: "subscription" }), [
      new TableIndex({ name: "IDX_org_subs_organization_id", columnNames: ["organization_id"] }),
      new TableIndex({ name: "IDX_org_subs_status_period_end", columnNames: ["status", "current_period_end"] }),
      new TableIndex({ name: "IDX_org_subs_status_grace", columnNames: ["status", "grace_period_end"] }),
    ]);

    // PostgreSQL Partial Unique Index: only 1 active subscription per organization at a time
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_org_subscriptions_active_status"
      ON "subscription"."organization_subscriptions" ("organization_id")
      WHERE "status" IN ('active', 'trialing', 'past_due', 'grace_period');
    `);

    await queryRunner.createForeignKeys(new Table({ name: "organization_subscriptions", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_org_subs_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_org_subs_plan_id",
        columnNames: ["plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_org_subs_price_id",
        columnNames: ["price_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_prices",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_org_subs_pending_plan_id",
        columnNames: ["pending_plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_org_subs_pending_price_id",
        columnNames: ["pending_price_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_prices",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    // 2. organization_subscription_items
    await queryRunner.createTable(
      new Table({
        name: "organization_subscription_items",
        schema: "subscription",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "subscription_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "item_type",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "plan_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "addon_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "quantity",
            type: "integer",
            default: 1,
            isNullable: false,
          },
          {
            name: "unit_price_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "currency",
            type: "varchar",
            length: "3",
            default: "'INR'",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "started_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "ended_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_subscription_items", schema: "subscription" }),
      new TableIndex({ name: "IDX_sub_items_active", columnNames: ["subscription_id", "is_active"] }),
    );

    await queryRunner.createForeignKeys(
      new Table({ name: "organization_subscription_items", schema: "subscription" }),
      [
        new TableForeignKey({
          name: "FK_sub_items_subscription_id",
          columnNames: ["subscription_id"],
          referencedSchema: "subscription",
          referencedTableName: "organization_subscriptions",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_sub_items_plan_id",
          columnNames: ["plan_id"],
          referencedSchema: "subscription",
          referencedTableName: "subscription_plans",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_sub_items_addon_id",
          columnNames: ["addon_id"],
          referencedSchema: "subscription",
          referencedTableName: "subscription_addons",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        }),
      ],
    );

    // 3. organization_entitlement_overrides
    await queryRunner.createTable(
      new Table({
        name: "organization_entitlement_overrides",
        schema: "subscription",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "organization_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "override_target",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "feature_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "limit_def_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "is_unlimited",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "override_limit_value",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "override_boolean_value",
            type: "boolean",
            isNullable: true,
          },
          {
            name: "reason",
            type: "varchar",
            length: "500",
            isNullable: false,
          },
          {
            name: "authorized_by",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "valid_from",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "valid_until",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createCheckConstraint(
      new Table({ name: "organization_entitlement_overrides", schema: "subscription" }),
      new TableCheck({
        name: "CHK_entitlement_override_target",
        expression: `(override_target = 'feature' AND feature_id IS NOT NULL AND limit_def_id IS NULL) OR (override_target = 'limit' AND limit_def_id IS NOT NULL AND feature_id IS NULL)`,
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_entitlement_overrides", schema: "subscription" }),
      new TableIndex({
        name: "IDX_entitlement_overrides_lookup",
        columnNames: ["organization_id", "valid_from", "valid_until"],
      }),
    );

    await queryRunner.createForeignKeys(
      new Table({ name: "organization_entitlement_overrides", schema: "subscription" }),
      [
        new TableForeignKey({
          name: "FK_entitlement_overrides_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_entitlement_overrides_feature_id",
          columnNames: ["feature_id"],
          referencedSchema: "subscription",
          referencedTableName: "subscription_features",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_entitlement_overrides_limit_def_id",
          columnNames: ["limit_def_id"],
          referencedSchema: "subscription",
          referencedTableName: "subscription_limit_definitions",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_entitlement_overrides_authorized_by",
          columnNames: ["authorized_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        }),
      ],
    );

    // 4. subscription_history
    await queryRunner.createTable(
      new Table({
        name: "subscription_history",
        schema: "subscription",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "organization_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "subscription_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "event_type",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "from_plan_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "to_plan_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "from_status",
            type: "varchar",
            length: "30",
            isNullable: true,
          },
          {
            name: "to_status",
            type: "varchar",
            length: "30",
            isNullable: true,
          },
          {
            name: "reason",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "actor_type",
            type: "varchar",
            length: "30",
            default: "'system'",
            isNullable: false,
          },
          {
            name: "actor_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "actor_name",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices(new Table({ name: "subscription_history", schema: "subscription" }), [
      new TableIndex({ name: "IDX_sub_history_org_created", columnNames: ["organization_id", "created_at"] }),
      new TableIndex({ name: "IDX_sub_history_subscription_created", columnNames: ["subscription_id", "created_at"] }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "subscription_history", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_history_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_history_subscription_id",
        columnNames: ["subscription_id"],
        referencedSchema: "subscription",
        referencedTableName: "organization_subscriptions",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_history_from_plan_id",
        columnNames: ["from_plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_history_to_plan_id",
        columnNames: ["to_plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_history_actor_id",
        columnNames: ["actor_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "subscription_history", schema: "subscription" }), true);
    await queryRunner.dropTable(
      new Table({ name: "organization_entitlement_overrides", schema: "subscription" }),
      true,
    );
    await queryRunner.dropTable(new Table({ name: "organization_subscription_items", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "organization_subscriptions", schema: "subscription" }), true);
  }
}
