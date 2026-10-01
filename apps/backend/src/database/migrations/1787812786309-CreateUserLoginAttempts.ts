import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserLoginAttempts1787812786309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_login_attempts",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: true },
          { name: "email", type: "varchar", length: "320", isNullable: true },
          { name: "ip_address", type: "varchar", length: "45", isNullable: true },
          { name: "user_agent", type: "text", isNullable: true },
          { name: "status", type: "varchar", length: "20", isNullable: false },
          { name: "failure_reason", type: "varchar", length: "100", isNullable: true },
          { name: "attempted_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_login_attempts", schema: "identity" }), true);
  }
}
