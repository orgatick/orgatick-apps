import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreatePermissiontable1789726996138 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("authorization", true);

    await queryRunner.createTable(
      new Table({
        schema: "authorization",
        name: "permissions",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "key", type: "varchar", length: "150", isUnique: true, isNullable: false },
          { name: "name", type: "varchar", length: "100", isNullable: false },
          { name: "description", type: "text", isNullable: true },
          { name: "resource", type: "varchar", length: "50", isNullable: false },
          { name: "action", type: "varchar", length: "50", isNullable: false },
          { name: "scope", type: "varchar", length: "30", isNullable: false },
          { name: "category", type: "varchar", length: "50", isNullable: false },
          { name: "is_active", type: "boolean", default: true, isNullable: false },
          { name: "created_at", type: "timestamptz", default: "now()", isNullable: false },
          { name: "updated_at", type: "timestamptz", default: "now()", isNullable: false },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ schema: "authorization", name: "permissions" }), true);
  }
}
