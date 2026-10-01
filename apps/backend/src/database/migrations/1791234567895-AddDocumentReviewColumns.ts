import { type MigrationInterface, type QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

/** Adds the admin document review workflow columns to organization_documents. */
export class AddDocumentReviewColumns1791234567895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({ name: "organization_documents", schema: "organization" });

    const hasStatus = await this.hasColumn(queryRunner, "status");
    if (!hasStatus) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "status", type: "varchar", length: "30", default: "'pending'", isNullable: false }),
      );
    }

    const hasReviewedBy = await this.hasColumn(queryRunner, "reviewed_by");
    if (!hasReviewedBy) {
      await queryRunner.addColumn(table, new TableColumn({ name: "reviewed_by", type: "bigint", isNullable: true }));
      await queryRunner.createForeignKey(
        table,
        new TableForeignKey({
          name: "FK_organization_documents_reviewed_by",
          columnNames: ["reviewed_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );
    }

    const hasReviewedAt = await this.hasColumn(queryRunner, "reviewed_at");
    if (!hasReviewedAt) {
      await queryRunner.addColumn(table, new TableColumn({ name: "reviewed_at", type: "timestamp", isNullable: true }));
    }

    const hasNote = await this.hasColumn(queryRunner, "review_note");
    if (!hasNote) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "review_note", type: "varchar", length: "500", isNullable: true }),
      );
    }

    if (!hasStatus) {
      await queryRunner.createIndex(
        table,
        new TableIndex({ name: "IDX_organization_documents_status", columnNames: ["status"] }),
      );
    }
  }

  private async hasColumn(queryRunner: QueryRunner, columnName: string): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      ["organization", "organization_documents", columnName],
    );
    return rows.length > 0;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: "organization_documents",
      schema: "organization",
    });
    try {
      await queryRunner.dropForeignKey(table, "FK_organization_documents_reviewed_by");
    } catch {
      // FK may not exist if down() runs partially.
    }
    await queryRunner.dropColumn(table, "review_note");
    await queryRunner.dropColumn(table, "reviewed_at");
    await queryRunner.dropColumn(table, "reviewed_by");
    await queryRunner.dropColumn(table, "status");
  }
}
