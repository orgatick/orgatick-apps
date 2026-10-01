import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationsTable1789402000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("organization", true);

    await queryRunner.createTable(
      new Table({
        name: "organizations",
        schema: "organization",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "slug",
            type: "varchar",
            length: "255",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "category_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "sub_category_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "address_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "logo",
            type: "varchar",
            length: "1000",
            isNullable: true,
          },
          {
            name: "email",
            type: "varchar",
            length: "320",
            isNullable: true,
          },
          {
            name: "phone_number",
            type: "varchar",
            length: "30",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            length: "30",
            default: "'active'",
            isNullable: false,
          },
          {
            name: "created_by",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "allow_paid_events",
            type: "boolean",
            default: false,
            isNullable: false,
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

    await queryRunner.createForeignKeys(new Table({ name: "organizations", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organizations_category_id",
        columnNames: ["category_id"],
        referencedSchema: "organization",
        referencedTableName: "organization_categories",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organizations_sub_category_id",
        columnNames: ["sub_category_id"],
        referencedSchema: "organization",
        referencedTableName: "organization_categories",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organizations_address_id",
        columnNames: ["address_id"],
        referencedSchema: "address",
        referencedTableName: "addresses",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organizations_created_by",
        columnNames: ["created_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndices(new Table({ name: "organizations", schema: "organization" }), [
      new TableIndex({ name: "IDX_organizations_category_id", columnNames: ["category_id"] }),
      new TableIndex({ name: "IDX_organizations_sub_category_id", columnNames: ["sub_category_id"] }),
      new TableIndex({ name: "IDX_organizations_address_id", columnNames: ["address_id"] }),
      new TableIndex({ name: "IDX_organizations_created_by", columnNames: ["created_by"] }),
      new TableIndex({ name: "IDX_organizations_status", columnNames: ["status"] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organizations", schema: "organization" }), true);
  }
}
