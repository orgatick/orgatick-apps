import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationDocumentsTable1789402700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_documents",
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
            name: "document_type",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "document_url",
            type: "varchar",
            length: "1000",
            isNullable: false,
          },
          {
            name: "uploaded_by",
            type: "bigint",
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

    await queryRunner.createForeignKeys(new Table({ name: "organization_documents", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_documents_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_documents_uploaded_by",
        columnNames: ["uploaded_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndices(new Table({ name: "organization_documents", schema: "organization" }), [
      new TableIndex({ name: "IDX_organization_documents_organization_id", columnNames: ["organization_id"] }),
      new TableIndex({ name: "IDX_organization_documents_uploaded_by", columnNames: ["uploaded_by"] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_documents", schema: "organization" }), true);
  }
}
