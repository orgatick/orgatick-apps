import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

/** Records every admin-driven status/access change (suspend, disable, block, archive, closure...). */
export class CreateOrganizationStatusHistoryTable1791234567891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_status_history",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: false },
          { name: "from_status", type: "varchar", length: "30", isNullable: true },
          { name: "to_status", type: "varchar", length: "30", isNullable: true },
          { name: "change_type", type: "varchar", length: "50", isNullable: false },
          { name: "reason", type: "varchar", length: "500", isNullable: true },
          { name: "changed_by", type: "bigint", isNullable: true },
          { name: "actor_name", type: "varchar", length: "255", isNullable: true },
          { name: "created_at", type: "timestamptz", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys(
      new Table({
        name: "organization_status_history",
        schema: "organization",
      }),
      [
        new TableForeignKey({
          name: "FK_organization_status_history_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
        new TableForeignKey({
          name: "FK_organization_status_history_changed_by",
          columnNames: ["changed_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      ],
    );

    await queryRunner.createIndex(
      new Table({
        name: "organization_status_history",
        schema: "organization",
      }),
      new TableIndex({
        name: "IDX_organization_status_history_organization_id",
        columnNames: ["organization_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      new Table({
        name: "organization_status_history",
        schema: "organization",
      }),
      true,
    );
  }
}
