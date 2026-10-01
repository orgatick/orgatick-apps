import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserPasskeys1787812786805 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_passkeys",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "credential_id", type: "varchar", length: "1024", isNullable: false },
          { name: "public_key", type: "text", isNullable: false },
          { name: "counter", type: "bigint", isNullable: false, default: "0" },
          { name: "device_type", type: "varchar", length: "50", isNullable: true },
          { name: "backed_up", type: "boolean", isNullable: false, default: false },
          { name: "name", type: "varchar", length: "100", isNullable: true },
          { name: "last_used_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_passkeys", schema: "identity" }), true);
  }
}
