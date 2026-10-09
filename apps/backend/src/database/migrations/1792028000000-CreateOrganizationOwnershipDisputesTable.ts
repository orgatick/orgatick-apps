import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

/**
 * Ownership disputes (18). Separate flow from the normal ownership transfer so
 * sensitive ownership operations can be frozen while an admin investigates.
 */
export class CreateOrganizationOwnershipDisputesTable1792028000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_ownership_disputes",
        schema: "organization",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "organization_id", type: "bigint", isNullable: false },
          { name: "disputant_id", type: "bigint", isNullable: false },
          { name: "current_owner_id", type: "bigint", isNullable: true },
          { name: "reason", type: "text", isNullable: false },
          { name: "evidence_urls", type: "text", isArray: true, isNullable: true },
          { name: "status", type: "varchar", length: "20", default: "'open'", isNullable: false },
          { name: "freeze_ownership", type: "boolean", default: false, isNullable: false },
          { name: "resolution", type: "text", isNullable: true },
          { name: "resolved_by", type: "bigint", isNullable: true },
          { name: "resolved_at", type: "timestamp", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    const disputesTable = await queryRunner.getTable("organization.organization_ownership_disputes");

    const existingIndices = new Set(disputesTable?.indices.map((i) => i.name?.toLowerCase()).filter(Boolean));
    if (!existingIndices.has("idx_organization_ownership_disputes_org_id")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_ownership_disputes", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_ownership_disputes_org_id", columnNames: ["organization_id"] }),
      );
    }
    if (!existingIndices.has("idx_organization_ownership_disputes_disputant_id")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_ownership_disputes", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_ownership_disputes_disputant_id", columnNames: ["disputant_id"] }),
      );
    }
    if (!existingIndices.has("idx_organization_ownership_disputes_status")) {
      await queryRunner.createIndex(
        new Table({ name: "organization_ownership_disputes", schema: "organization" }),
        new TableIndex({ name: "IDX_organization_ownership_disputes_status", columnNames: ["status"] }),
      );
    }

    const existingFkCols = new Set(disputesTable?.foreignKeys.flatMap((f) => f.columnNames) ?? []);

    const fksToCreate: TableForeignKey[] = [];
    if (!existingFkCols.has("organization_id")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_ownership_disputes_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }
    if (!existingFkCols.has("disputant_id")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_ownership_disputes_disputant_id",
          columnNames: ["disputant_id"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );
    }
    if (!existingFkCols.has("current_owner_id")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_ownership_disputes_current_owner",
          columnNames: ["current_owner_id"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );
    }
    if (!existingFkCols.has("resolved_by")) {
      fksToCreate.push(
        new TableForeignKey({
          name: "FK_organization_ownership_disputes_resolved_by",
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
        new Table({ name: "organization_ownership_disputes", schema: "organization" }),
        fksToCreate,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_ownership_disputes", schema: "organization" }), true);
  }
}
