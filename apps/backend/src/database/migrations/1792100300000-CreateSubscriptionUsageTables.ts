import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class CreateSubscriptionUsageTables1792100300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. subscription_usage_counters
    await queryRunner.createTable(
      new Table({
        name: "subscription_usage_counters",
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
            name: "limit_def_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "current_value",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "last_recalculated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
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

    await queryRunner.createUniqueConstraint(
      new Table({ name: "subscription_usage_counters", schema: "subscription" }),
      new TableUnique({
        name: "UQ_subscription_usage_counters_org_limit",
        columnNames: ["organization_id", "limit_def_id"],
      }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_usage_counters", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_usage_counters_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_usage_counters_limit_def_id",
        columnNames: ["limit_def_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_limit_definitions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    // 2. subscription_usage_periods
    await queryRunner.createTable(
      new Table({
        name: "subscription_usage_periods",
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
            name: "limit_def_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "period_start",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "period_end",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "usage_count",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "limit_snapshot",
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
      new Table({ name: "subscription_usage_periods", schema: "subscription" }),
      new TableUnique({
        name: "UQ_subscription_usage_periods_window",
        columnNames: ["organization_id", "limit_def_id", "period_start", "period_end"],
      }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_usage_periods", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_usage_periods_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_usage_periods_limit_def_id",
        columnNames: ["limit_def_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_limit_definitions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "subscription_usage_periods", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_usage_counters", schema: "subscription" }), true);
  }
}
