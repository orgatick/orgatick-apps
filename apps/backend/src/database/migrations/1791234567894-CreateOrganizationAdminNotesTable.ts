import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

/** Internal admin notes attached to an organization. */
export class CreateOrganizationAdminNotesTable1791234567894 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_admin_notes",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: false },
          { name: "note", type: "text", isNullable: false },
          { name: "created_by", type: "bigint", isNullable: true },
          { name: "actor_name", type: "varchar", length: "255", isNullable: true },
          { name: "created_at", type: "timestamptz", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys(new Table({ name: "organization_admin_notes", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_admin_notes_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_admin_notes_created_by",
        columnNames: ["created_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndex(
      new Table({ name: "organization_admin_notes", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_admin_notes_organization_id",
        columnNames: ["organization_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_admin_notes", schema: "organization" }), true);
  }
}
