import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class CreateOrganizationSocialLinksTable1789402500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_social_links",
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
            name: "platform",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "url",
            type: "varchar",
            length: "500",
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
      new Table({ name: "organization_social_links", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_social_links_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createUniqueConstraint(
      new Table({ name: "organization_social_links", schema: "organization" }),
      new TableUnique({
        name: "idx_organization_social_links_organization_id_platform",
        columnNames: ["organization_id", "platform"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "organization_social_links", schema: "organization" }),
      new TableIndex({ name: "IDX_organization_social_links_organization_id", columnNames: ["organization_id"] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_social_links", schema: "organization" }), true);
  }
}
