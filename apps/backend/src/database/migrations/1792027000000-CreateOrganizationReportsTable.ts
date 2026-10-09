import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

/**
 * Organization reports / complaints (§17). User-side submissions are reviewed by
 * platform admins; resolution is recorded on the row.
 */
export class CreateOrganizationReportsTable1792027000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_reports",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: false },
          { name: "reporter_id", type: "bigint", isNullable: false },
          { name: "category", type: "varchar", length: "30", isNullable: false },
          { name: "description", type: "text", isNullable: false },
          { name: "evidence_urls", type: "text", isArray: true, isNullable: true },
          { name: "status", type: "varchar", length: "20", default: "'open'", isNullable: false },
          { name: "resolution", type: "text", isNullable: true },
          { name: "resolved_by", type: "bigint", isNullable: true },
          { name: "resolved_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    const reportsTable = await queryRunner.getTable("organization.organization_reports");

    const existingIndices = new Set(reportsTable?.indices.map((i) => i.name?.toLowerCase()).filter(Boolean));
    if (!existingIndices.has("idx_organization_reports_org_id")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_reports", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_reports_org_id", columnNames: ["organization_id"] }),
      );
    }
    if (!existingIndices.has("idx_organization_reports_reporter_id")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_reports", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_reports_reporter_id", columnNames: ["reporter_id"] }),
      );
    }
    if (!existingIndices.has("idx_organization_reports_status")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_reports", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_reports_status", columnNames: ["status"] }),
      );
    }

    const existingFkCols = new Set(reportsTable?.foreignKeys.flatMap((f) => f.columnNames) ?? []);

    const fksToCreate: TableForeignKey[] = [];
    if (!existingFkCols.has("organization_id")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_reports_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }
    if (!existingFkCols.has("reporter_id")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_reports_reporter_id",
          columnNames: ["reporter_id"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }
    if (!existingFkCols.has("resolved_by")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_reports_resolved_by",
          columnNames: ["resolved_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );
    }

    if (fksToCreate.length > 0) {
      await queryRunner.createForeignKeys(
        new Table({ name: "organization_reports", schema: "organization" }),
        fksToCreate,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_reports", schema: "organization" }), true);
  }
}
