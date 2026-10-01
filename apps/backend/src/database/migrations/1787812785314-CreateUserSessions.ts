import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserSessions1787812785314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_sessions",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "session_token_hash", type: "varchar", length: "255", isNullable: false },
          { name: "expires_at", type: "timestamp", isNullable: true },
          { name: "revoked_at", type: "timestamp", isNullable: true },
          { name: "last_activity_at", type: "timestamp", isNullable: true },
          { name: "ip_address", type: "varchar", length: "45", isNullable: true },
          { name: "user_agent", type: "text", isNullable: true },
          { name: "device_id", type: "bigint", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_sessions", schema: "identity" }), true);
  }
}
