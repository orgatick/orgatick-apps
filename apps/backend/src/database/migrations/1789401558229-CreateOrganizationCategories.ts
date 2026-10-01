import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationCategories1789401558229 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("organization", true);

    await queryRunner.createTable(
      new Table({
        name: "organization_categories",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "parent_id", type: "bigint", isNullable: true },
          { name: "name", type: "varchar", length: "100", isNullable: false },
          { name: "slug", type: "varchar", length: "100", isUnique: true, isNullable: false },
          { name: "level", type: "smallint", isNullable: false, default: 1 },
          { name: "description", type: "text", isNullable: true },
          { name: "is_active", type: "boolean", default: true, isNullable: false },
          { name: "sort_order", type: "smallint", default: 0, isNullable: false },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    // Self-reference: Category → Parent Category
    await queryRunner.createForeignKey(
      new Table({ name: "organization_categories", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_categories_parent",
        columnNames: ["parent_id"],
        referencedSchema: "organization",
        referencedTableName: "organization_categories",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_categories", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_categories_parent_id",
        columnNames: ["parent_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_categories", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_categories_level",
        columnNames: ["level"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_categories", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_categories_is_active",
        columnNames: ["is_active"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_categories", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_categories_sort_order",
        columnNames: ["sort_order"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_categories", schema: "organization" }), true);
  }
}
