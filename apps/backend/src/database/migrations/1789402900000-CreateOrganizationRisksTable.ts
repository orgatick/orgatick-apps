import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationRisksTable1789402900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_risks",
        schema: "organization",
        columns: [
          {
            name: "organization_id",
            type: "bigint",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "trust_score",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 100.0,
            isNullable: false,
          },
          {
            name: "is_flagged",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "flagged_reason",
            type: "text",
            isNullable: true,
          },
          {
            name: "reviewed_by",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "reviewed_at",
            type: "timestamp",
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

    await queryRunner.createForeignKeys(new Table({ name: "organization_risks", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_risks_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_risks_reviewed_by",
        columnNames: ["reviewed_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndex(
      new Table({ name: "organization_risks", schema: "organization" }),
      new TableIndex({ name: "IDX_organization_risks_is_flagged", columnNames: ["is_flagged"] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_risks", schema: "organization" }), true);
  }
}
