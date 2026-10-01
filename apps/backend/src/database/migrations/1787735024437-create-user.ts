import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateUser1787735024437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("identity", true);

    await queryRunner.createTable(
      new Table({
        name: "users",
        schema: "identity",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "name", type: "varchar", length: "255", isNullable: false },
          { name: "email", type: "varchar", length: "320", isNullable: false },
          { name: "normalized_email", type: "varchar", length: "320", isNullable: true },
          { name: "gender", type: "varchar", length: "20", isNullable: true },
          { name: "phone_number", type: "varchar", length: "30", isNullable: true },
          { name: "avatar", type: "varchar", length: "1000", isNullable: true },
          { name: "address", type: "text", isNullable: true },
          { name: "bio", type: "text", isNullable: true },
          { name: "role", type: "varchar", length: "20", isNullable: false, default: "'user'" },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
        ],
        checks: [
          { name: "CHK_USERS_ROLE", expression: "role IN ('user', 'admin')" },
          { name: "CHK_USERS_GENDER", expression: "gender IS NULL OR gender IN ('male', 'female', 'notToSay')" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "users", schema: "identity" }), true);
  }
}
