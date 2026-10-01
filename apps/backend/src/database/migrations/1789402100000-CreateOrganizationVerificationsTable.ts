import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationVerificationsTable1789402100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_verifications",
        schema: "organization",
        columns: [
          {
            name: "organization_id",
            type: "bigint",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "30",
            default: "'pending'",
            isNullable: false,
          },
          {
            name: "verified_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "verified_by",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "rejection_reason",
            type: "text",
            isNullable: true,
          },
          {
            name: "last_checked_by",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys(new Table({ name: "organization_verifications", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_verifications_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_verifications_verified_by",
        columnNames: ["verified_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_verifications_last_checked_by",
        columnNames: ["last_checked_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndex(
      new Table({ name: "organization_verifications", schema: "organization" }),
      new TableIndex({ name: "IDX_organization_verifications_status", columnNames: ["status"] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_verifications", schema: "organization" }), true);
  }
}
