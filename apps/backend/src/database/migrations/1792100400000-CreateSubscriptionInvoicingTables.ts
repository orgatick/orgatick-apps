import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateSubscriptionInvoicingTables1792100400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. subscription_invoices
    await queryRunner.createTable(
      new Table({
        name: "subscription_invoices",
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
            name: "public_id",
            type: "varchar",
            length: "36",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "invoice_number",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
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
            name: "billing_reason",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "30",
            default: "'draft'",
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
            name: "subtotal_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "tax_amount_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "total_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "proration_credit_minor_units",
            type: "bigint",
            default: 0,
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
            name: "due_date",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "paid_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "pdf_url",
            type: "varchar",
            length: "1000",
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

    await queryRunner.createIndices(new Table({ name: "subscription_invoices", schema: "subscription" }), [
      new TableIndex({ name: "IDX_sub_invoices_org_status", columnNames: ["organization_id", "status"] }),
      new TableIndex({ name: "IDX_sub_invoices_due_date_status", columnNames: ["due_date", "status"] }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "subscription_invoices", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_invoices_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_invoices_subscription_id",
        columnNames: ["subscription_id"],
        referencedSchema: "subscription",
        referencedTableName: "organization_subscriptions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    // 2. subscription_invoice_items
    await queryRunner.createTable(
      new Table({
        name: "subscription_invoice_items",
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
            name: "invoice_id",
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
            name: "description",
            type: "varchar",
            length: "255",
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
            name: "price_id",
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
            name: "subtotal_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "tax_type",
            type: "varchar",
            length: "50",
            default: "'GST'",
            isNullable: false,
          },
          {
            name: "tax_rate_bps",
            type: "integer",
            isNullable: false,
          },
          {
            name: "tax_amount_minor_units",
            type: "bigint",
            default: 0,
            isNullable: false,
          },
          {
            name: "total_minor_units",
            type: "bigint",
            default: 0,
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
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      new Table({ name: "subscription_invoice_items", schema: "subscription" }),
      new TableIndex({ name: "IDX_sub_invoice_items_invoice_id", columnNames: ["invoice_id"] }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_invoice_items", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_invoice_items_invoice_id",
        columnNames: ["invoice_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_invoices",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_invoice_items_plan_id",
        columnNames: ["plan_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_plans",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_invoice_items_addon_id",
        columnNames: ["addon_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_addons",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_invoice_items_price_id",
        columnNames: ["price_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_prices",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    // 3. subscription_payments
    await queryRunner.createTable(
      new Table({
        name: "subscription_payments",
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
            name: "invoice_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "organization_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "payment_order_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "amount_minor_units",
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
            name: "status",
            type: "varchar",
            length: "30",
            default: "'pending'",
            isNullable: false,
          },
          {
            name: "idempotency_key",
            type: "varchar",
            length: "255",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "error_code",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "error_description",
            type: "text",
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
      new Table({ name: "subscription_payments", schema: "subscription" }),
      new TableIndex({ name: "IDX_sub_payments_invoice_status", columnNames: ["invoice_id", "status"] }),
    );

    await queryRunner.createForeignKeys(new Table({ name: "subscription_payments", schema: "subscription" }), [
      new TableForeignKey({
        name: "FK_sub_payments_invoice_id",
        columnNames: ["invoice_id"],
        referencedSchema: "subscription",
        referencedTableName: "subscription_invoices",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_sub_payments_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "subscription_payments", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_invoice_items", schema: "subscription" }), true);
    await queryRunner.dropTable(new Table({ name: "subscription_invoices", schema: "subscription" }), true);
  }
}
