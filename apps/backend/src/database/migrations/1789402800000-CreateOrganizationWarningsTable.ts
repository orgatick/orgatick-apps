import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationWarningsTable1789402800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_warnings",
        schema: "organization",
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
            name: "reason",
            type: "text",
            isNullable: false,
          },
          {
            name: "issued_by",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "resolved_at",
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

    await queryRunner.createForeignKeys(new Table({ name: "organization_warnings", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_warnings_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_warnings_issued_by",
        columnNames: ["issued_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndices(new Table({ name: "organization_warnings", schema: "organization" }), [
      new TableIndex({ name: "IDX_organization_warnings_organization_id", columnNames: ["organization_id"] }),
      new TableIndex({ name: "IDX_organization_warnings_issued_by", columnNames: ["issued_by"] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_warnings", schema: "organization" }), true);
  }
}
