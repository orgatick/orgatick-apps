import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationBankAccountsTable1792031000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("organization.organization_bank_accounts");
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "organization_bank_accounts",
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
              name: "account_holder_name",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "account_number",
              type: "varchar",
              length: "100",
              isNullable: false,
            },
            {
              name: "ifsc_code",
              type: "varchar",
              length: "20",
              isNullable: false,
            },
            {
              name: "bank_name",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "branch_name",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "account_type",
              type: "varchar",
              length: "30",
              default: "'current'",
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
              name: "verification_notes",
              type: "varchar",
              length: "500",
              isNullable: true,
            },
            {
              name: "document_id",
              type: "bigint",
              isNullable: true,
            },
            {
              name: "verified_by",
              type: "bigint",
              isNullable: true,
            },
            {
              name: "verified_at",
              type: "timestamp",
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

      await queryRunner.createForeignKey(
        new Table({ name: "organization_bank_accounts", schema: "organization" }),
        new TableForeignKey({
          name: "FK_organization_bank_accounts_organization_id",
          columnNames: ["organization_id"],
          referencedSchema: "organization",
          referencedTableName: "organizations",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }),
      );

      await queryRunner.createForeignKey(
        new Table({ name: "organization_bank_accounts", schema: "organization" }),
        new TableForeignKey({
          name: "FK_organization_bank_accounts_verified_by",
          columnNames: ["verified_by"],
          referencedSchema: "identity",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        }),
      );

      await queryRunner.createIndices(new Table({ name: "organization_bank_accounts", schema: "organization" }), [
        new TableIndex({
          name: "IDX_organization_bank_accounts_org_id",
          columnNames: ["organization_id"],
          isUnique: true,
        }),
        new TableIndex({
          name: "IDX_organization_bank_accounts_status",
          columnNames: ["status"],
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("organization.organization_bank_accounts");
    if (tableExists) {
      await queryRunner.dropTable(new Table({ name: "organization_bank_accounts", schema: "organization" }), true);
    }
  }
}
