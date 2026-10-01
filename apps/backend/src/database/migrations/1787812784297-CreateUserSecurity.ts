import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserSecurity1787812784297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_security",
        schema: "identity",
        columns: [
          { name: "user_id", type: "bigint", isPrimary: true, isNullable: false },
          { name: "is_verified", type: "boolean", isNullable: false, default: false },
          { name: "last_password_change_at", type: "timestamp", isNullable: true },
          { name: "last_mfa_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_security", schema: "identity" }), true);
  }
}
