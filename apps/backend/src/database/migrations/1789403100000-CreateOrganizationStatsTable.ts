import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrganizationStatsTable1789403100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_stats",
        schema: "organization",
        columns: [
          {
            name: "organization_id",
            type: "bigint",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "total_events",
            type: "int",
            default: 0,
            isNullable: false,
          },
          {
            name: "total_participants",
            type: "int",
            default: 0,
            isNullable: false,
          },
          {
            name: "total_paid_registrations",
            type: "int",
            default: 0,
            isNullable: false,
          },
          {
            name: "total_revenue",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0.0,
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
      new Table({ name: "organization_stats", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_stats_organization_id",
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
    await queryRunner.dropTable(new Table({ name: "organization_stats", schema: "organization" }), true);
  }
}
