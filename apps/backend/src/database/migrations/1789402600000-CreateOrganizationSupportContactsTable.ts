import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationSupportContactsTable1789402600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_support_contacts",
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
            name: "organization_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
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
            name: "is_primary",
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

    await queryRunner.createForeignKey(
      new Table({ name: "organization_support_contacts", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_support_contacts_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_support_contacts", schema: "organization" }),
      new TableIndex({
        name: "IDX_organization_support_contacts_organization_id",
        columnNames: ["organization_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_support_contacts", schema: "organization" }), true);
  }
}
