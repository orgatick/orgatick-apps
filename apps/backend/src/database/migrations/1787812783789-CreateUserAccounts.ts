import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserAccounts1787812783789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_accounts",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "provider", type: "varchar", length: "50", isNullable: false },
          { name: "provider_account_id", type: "varchar", length: "255", isNullable: true },
          { name: "password_hash", type: "varchar", length: "255", isNullable: true },
          { name: "last_login_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_accounts", schema: "identity" }), true);
  }
}
