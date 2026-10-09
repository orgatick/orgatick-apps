import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrganizationPricingSettingsTable1792030000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("organization.organization_pricing_settings");
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "organization_pricing_settings",
          schema: "organization",
          columns: [
            {
              name: "organization_id",
              type: "bigint",
              isPrimary: true,
              isNullable: false,
            },
            {
              name: "paid_events_enabled",
              type: "boolean",
              default: false,
              isNullable: false,
            },
            {
              name: "require_bank_details",
              type: "boolean",
              default: true,
              isNullable: false,
            },
            {
              name: "disabled_reason",
              type: "varchar",
              length: "500",
              isNullable: true,
            },
            {
              name: "updated_by",
              type: "bigint",
              isNullable: true,
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
              isNullable: false,
            },
            {
              name: "updated_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
              isNullable: false,
            },
          ],
        }),
        true,
      );

      await queryRunner.createForeignKey(
        new Table({ name: "organization_pricing_settings", schema: "organization" }),
        new TableForeignKey({
          name: "FK_organization_pricing_settings_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );

      await queryRunner.createForeignKey(
        new Table({ name: "organization_pricing_settings", schema: "organization" }),
        new TableForeignKey({
          name: "FK_organization_pricing_settings_updated_by",
          columnNames: ["updated_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );

      // Backfill existing organizations
      await queryRunner.query(`
        INSERT INTO "organization"."organization_pricing_settings" ("organization_id", "paid_events_enabled", "require_bank_details")
        SELECT id, COALESCE(allow_paid_events, false), true
        FROM "organization"."organizations"
        ON CONFLICT ("organization_id") DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("organization.organization_pricing_settings");
    if (tableExists) {
      await queryRunner.dropTable(new Table({ name: "organization_pricing_settings", schema: "organization" }), true);
    }
  }
}
