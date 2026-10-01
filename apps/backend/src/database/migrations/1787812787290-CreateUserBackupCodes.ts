import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserBackupCodes1787812787290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_backup_codes",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "code_hash", type: "varchar", length: "255", isNullable: false },
          { name: "used_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_backup_codes", schema: "identity" }), true);
  }
}
