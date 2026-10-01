import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationPaymentAccountsTable1789403000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_payment_accounts",
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
            name: "provider",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "account_id",
            type: "varchar",
            length: "255",
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
      new Table({ name: "organization_payment_accounts", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_payment_accounts_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createIndices(new Table({ name: "organization_payment_accounts", schema: "organization" }), [
      new TableIndex({
        name: "IDX_organization_payment_accounts_organization_id",
        columnNames: ["organization_id"],
      }),
      new TableIndex({
        name: "IDX_organization_payment_accounts_status",
        columnNames: ["status"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_payment_accounts", schema: "organization" }), true);
  }
}
