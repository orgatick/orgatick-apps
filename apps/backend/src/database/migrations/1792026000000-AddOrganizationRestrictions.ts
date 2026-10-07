import { type MigrationInterface, type QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

/**
 * Capability-based restrictions (§15). Stored as a text[] of capability keys on the
 * admin state row so restrictions are independent of organization status.
 */
export class AddOrganizationRestrictions1792026000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({ name: "organization_admin_state", schema: "organization" });

    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: "restricted_capabilities",
        type: "text",
        isArray: true,
        default: "'{}'",
        isNullable: false,
      }),
    );
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: "restrictions_reason",
        type: "varchar",
        length: "500",
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: "restrictions_updated_by",
        type: "bigint",
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: "restrictions_updated_at",
        type: "timestamp",
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      table,
      new TableForeignKey({
        name: "FK_organization_admin_state_restrictions_updated_by",
        columnNames: ["restrictions_updated_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({ name: "organization_admin_state", schema: "organization" });
    await queryRunner.dropForeignKey(table, "FK_organization_admin_state_restrictions_updated_by");
    await queryRunner.dropColumn(table, "restrictions_updated_at");
    await queryRunner.dropColumn(table, "restrictions_updated_by");
    await queryRunner.dropColumn(table, "restrictions_reason");
    await queryRunner.dropColumn(table, "restricted_capabilities");
  }
}
