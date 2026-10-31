import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from "typeorm";

export class CreateSubscriptionCatalogTables1792100100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("subscription", true);

    // 1. subscription_plans
    await queryRunner.createTable(
      new Table({
        name: "subscription_plans",
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
            name: "code",
            type: "varchar",
            length: "50",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "tier_level",
            type: "integer",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "is_public",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "trial_period_days",
            type: "integer",
            default: 0,
            isNullable: false,
          },
          {
            name: "sort_order",
            type: "integer",
            default: 0,
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

    await queryRunner.createIndices(new Table({ name: "subscription_plans", schema: "subscription" }), [
      new TableIndex({ name: "IDX_subscription_plans_active_public", columnNames: ["is_active", "is_public"] }),
      new TableIndex({ name: "IDX_subscription_plans_tier_level", columnNames: ["tier_level"] }),
    ]);

    // 2. subscription_features
    await queryRunner.createTable(
      new Table({
        name: "subscription_features",
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
            name: "code",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "category",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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

    await queryRunner.createIndex(
      new Table({ name: "subscription_features", schema: "subscription" }),
      new TableIndex({ name: "IDX_subscription_features_category_active", columnNames: ["category", "is_active"] }),
    );

    // 3. subscription_limit_definitions
    await queryRunner.createTable(
      new Table({
        name: "subscription_limit_definitions",
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
            name: "code",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "limit_scope",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "metric_type",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "unit",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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

    // 4. subscription_plan_features
    await queryRunner.createTable(
      new Table({
        name: "subscription_plan_features",
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
            name: "plan_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "feature_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "is_included",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "feature_level",
            type: "varchar",
            length: "50",
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

    await queryRunner.createUniqueConstraint(
      new Table({ name: "subscription_plan_features", schema: "subscription" }),
      new TableUnique({
        name: "UQ_subscription_plan_features_plan_feature",
        columnNames: ["plan_id", "feature_id"],
      }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_plan_features", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_plan_features_plan_id",
        columnNames: ["plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_plan_features_feature_id",
        columnNames: ["feature_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_features",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    // 5. subscription_plan_limits
    await queryRunner.createTable(
      new Table({
        name: "subscription_plan_limits",
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
            name: "plan_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "limit_def_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "is_unlimited",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "limit_value",
            type: "bigint",
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

    await queryRunner.createUniqueConstraint(
      new Table({ name: "subscription_plan_limits", schema: "subscription" }),
      new TableUnique({
        name: "UQ_subscription_plan_limits_plan_limit_def",
        columnNames: ["plan_id", "limit_def_id"],
      }),
    );

    await queryRunner.createCheckConstraint(
      new Table({ name: "subscription_plan_limits", schema: "subscription" }),
      new TableCheck({
        name: "CHK_sub_plan_limits_unlimited",
        expression: `(is_unlimited = true AND limit_value IS NULL) OR (is_unlimited = false AND limit_value IS NOT NULL AND limit_value >= 0)`,
      }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_plan_limits", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_plan_limits_plan_id",
        columnNames: ["plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_plan_limits_limit_def_id",
        columnNames: ["limit_def_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_limit_definitions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    // 6. subscription_prices
    await queryRunner.createTable(
      new Table({
        name: "subscription_prices",
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
            name: "plan_id",
            type: "bigint",
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
            name: "billing_interval",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "price_in_minor_units",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "valid_from",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "valid_to",
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

    await queryRunner.createUniqueConstraint(
      new Table({ name: "subscription_prices", schema: "subscription" }),
      new TableUnique({
        name: "UQ_subscription_prices_temporal",
        columnNames: ["plan_id", "currency", "billing_interval", "valid_from"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "subscription_prices", schema: "subscription" }),
      new TableIndex({ name: "IDX_subscription_prices_plan_active", columnNames: ["plan_id", "is_active"] }),
    );

    await queryRunner.createForeignKey(
      new Table({ name: "subscription_prices", schema: "subscription" }),
      new TableForeignKey({
        name: "FK_sub_prices_plan_id",
        columnNames: ["plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );

    // 7. subscription_addons
    await queryRunner.createTable(
      new Table({
        name: "subscription_addons",
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
            name: "code",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "addon_type",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "target_limit_def_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "target_feature_id",
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
            name: "increase_value",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "currency",
            type: "varchar",
            length: "3",
            default: "'INR'",
            isNullable: false,
          },
          {
            name: "billing_interval",
            type: "varchar",
            length: "20",
            default: "'month'",
            isNullable: false,
          },
          {
            name: "price_in_minor_units",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "valid_from",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "valid_to",
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
      new Table({ name: "subscription_addons", schema: "subscription" }),
      new TableIndex({ name: "IDX_subscription_addons_active_type", columnNames: ["is_active", "addon_type"] }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_addons", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_addons_limit_def_id",
        columnNames: ["target_limit_def_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_limit_definitions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_addons_feature_id",
        columnNames: ["target_feature_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_features",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "subscription_addons", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_prices", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_plan_limits", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_plan_features", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_limit_definitions", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_features", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_plans", schema: "subscription" }), true);
    await queryRunner.dropSchema("subscription", true, true);
  }
}
