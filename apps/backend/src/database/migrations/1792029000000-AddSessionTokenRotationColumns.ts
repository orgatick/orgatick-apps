import { type MigrationInterface, type QueryRunner, Table, TableColumn } from "typeorm";

export class AddSessionTokenRotationColumns1792029000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({ name: "user_sessions", schema: "identity" });

    if (!(await queryRunner.hasColumn(table, "rotation_counter"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "rotation_counter",
          type: "integer",
          default: 1,
          isNullable: false,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(table, "revoked_reason"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "revoked_reason",
          type: "varchar",
          length: "100",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({ name: "user_sessions", schema: "identity" });
    if (await queryRunner.hasColumn(table, "revoked_reason")) {
      await queryRunner.dropColumn(table, "revoked_reason");
    }
    if (await queryRunner.hasColumn(table, "rotation_counter")) {
      await queryRunner.dropColumn(table, "rotation_counter");
    }
  }
}
