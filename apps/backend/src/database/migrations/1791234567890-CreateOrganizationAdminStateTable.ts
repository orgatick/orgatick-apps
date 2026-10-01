import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

/**
 * 1:1 admin management state per organization (blocked, hidden, archived, closure,
 * suspension/disable reason). Kept out of the organizations row on purpose.
 */
export class CreateOrganizationAdminStateTable1791234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_admin_state",
        schema: "organization",
        columns: [
          { name: "organization_id", type: "bigint", isPrimary: true, isNullable: false },
          { name: "admin_reason", type: "varchar", length: "500", isNullable: true },
          { name: "blocked", type: "boolean", default: false, isNullable: false },
          { name: "blocked_at", type: "timestamp", isNullable: true },
          { name: "block_reason", type: "varchar", length: "500", isNullable: true },
          { name: "blocked_by", type: "bigint", isNullable: true },
          { name: "hidden", type: "boolean", default: false, isNullable: false },
          { name: "hidden_at", type: "timestamp", isNullable: true },
          { name: "hidden_reason", type: "varchar", length: "500", isNullable: true },
          { name: "hidden_by", type: "bigint", isNullable: true },
          { name: "archived", type: "boolean", default: false, isNullable: false },
          { name: "archived_at", type: "timestamp", isNullable: true },
          { name: "archived_reason", type: "varchar", length: "500", isNullable: true },
          { name: "archived_by", type: "bigint", isNullable: true },
          { name: "closure_requested_at", type: "timestamp", isNullable: true },
          { name: "closure_requested_by", type: "bigint", isNullable: true },
          { name: "closure_reason", type: "varchar", length: "500", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys(new Table({ name: "organization_admin_state", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_admin_state_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_admin_state_blocked_by",
        columnNames: ["blocked_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_admin_state_hidden_by",
        columnNames: ["hidden_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_admin_state_archived_by",
        columnNames: ["archived_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_admin_state_closure_requested",
        columnNames: ["closure_requested_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_admin_state", schema: "organization" }), true);
  }
}
