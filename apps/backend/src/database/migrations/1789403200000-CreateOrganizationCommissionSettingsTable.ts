import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrganizationCommissionSettingsTable1789403200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_commission_settings",
        schema: "organization",
        columns: [
          {
            name: "organization_id",
            type: "bigint",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "commission_percentage",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 7.0,
            isNullable: false,
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
      new Table({ name: "organization_commission_settings", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_commission_settings_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_commission_settings", schema: "organization" }), true);
  }
}
