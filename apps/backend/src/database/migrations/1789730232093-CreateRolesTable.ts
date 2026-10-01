import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateRolesTable1789730232093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: "authorization",
        name: "roles",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: true },
          { name: "key", type: "varchar", length: "100", isNullable: false },
          { name: "name", type: "varchar", length: "100", isNullable: false },
          { name: "description", type: "text", isNullable: true },
          { name: "is_active", type: "boolean", isNullable: false, default: true },
          { name: "created_at", type: "timestamptz", isNullable: false, default: "now()" },
          { name: "updated_at", type: "timestamptz", isNullable: false, default: "now()" },
        ],
        indices: [
          {
            name: "IDX_roles_organization_id",
            columnNames: ["organization_id"],
          },
          {
            name: "UQ_roles_organization_key",
            columnNames: ["organization_id", "key"],
            isUnique: true,
          },
        ],
        foreignKeys: [
          {
            name: "FK_roles_organization",
            columnNames: ["organization_id"],
            referencedSchema: "organization",
            referencedTableName: "organizations",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        schema: "authorization",
        name: "role_permissions",
        columns: [
          { name: "role_id", type: "bigint", isPrimary: true },
          { name: "permission_id", type: "bigint", isPrimary: true },
          { name: "created_at", type: "timestamptz", isNullable: false, default: "now()" },
        ],
        foreignKeys: [
          {
            name: "FK_role_permissions_role",
            columnNames: ["role_id"],
            referencedSchema: "authorization",
            referencedTableName: "roles",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          {
            name: "FK_role_permissions_permission",
            columnNames: ["permission_id"],
            referencedSchema: "authorization",
            referencedTableName: "permissions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("authorization.role_permissions", true);
    await queryRunner.dropTable("authorization.roles", true);
  }
}
