import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class CreateOrganizationMembersTable1789402200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_members",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: false },
          { name: "user_id", type: "bigint", isNullable: false },
          { name: "role_id", type: "bigint", isNullable: false },
          { name: "status", type: "varchar", length: "30", default: "'active'", isNullable: false },
          { name: "joined_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys(new Table({ name: "organization_members", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_members_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_members_user_id",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createUniqueConstraint(
      new Table({ name: "organization_members", schema: "organization" }),
      new TableUnique({
        name: "idx_organization_members_organization_id_user_id",
        columnNames: ["organization_id", "user_id"],
      }),
    );

    await queryRunner.createIndices(new Table({ name: "organization_members", schema: "organization" }), [
      new TableIndex({ name: "IDX_organization_members_organization_id", columnNames: ["organization_id"] }),
      new TableIndex({ name: "IDX_organization_members_user_id", columnNames: ["user_id"] }),
      new TableIndex({ name: "IDX_organization_members_role_id", columnNames: ["role_id"] }),
      new TableIndex({ name: "IDX_organization_members_status", columnNames: ["status"] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_members", schema: "organization" }), true);
  }
}
