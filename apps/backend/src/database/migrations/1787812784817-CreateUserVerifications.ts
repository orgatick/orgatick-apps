import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUserVerifications1787812784817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_verifications",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "type", type: "varchar", length: "20", isNullable: false },
          { name: "purpose", type: "varchar", length: "30", isNullable: false },
          { name: "target", type: "varchar", length: "320", isNullable: false },
          { name: "token_hash", type: "varchar", length: "255", isNullable: false },
          { name: "expires_at", type: "timestamp", isNullable: false },
          { name: "verified_at", type: "timestamp", isNullable: true },
          { name: "attempts", type: "integer", isNullable: false, default: 0 },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_verifications", schema: "identity" }), true);
  }
}
