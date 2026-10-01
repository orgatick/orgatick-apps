import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrganizationInvitationsTable1789402300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "organization_invitations",
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
            name: "email",
            type: "varchar",
            length: "320",
            isNullable: false,
          },
          {
            name: "role",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "invited_by",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "token_hash",
            type: "varchar",
            length: "255",
            isUnique: true,
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
            name: "expires_at",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "accepted_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "rejected_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "cancelled_at",
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

    await queryRunner.createForeignKeys(new Table({ name: "organization_invitations", schema: "organization" }), [
      new TableForeignKey({
        name: "FK_organization_invitations_organization_id",
        columnNames: ["organization_id"],
        referencedSchema: "organization",
        referencedTableName: "organizations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_organization_invitations_invited_by",
        columnNames: ["invited_by"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createIndices(new Table({ name: "organization_invitations", schema: "organization" }), [
      new TableIndex({
        name: "idx_organization_invitations_organization_id_email",
        columnNames: ["organization_id", "email"],
      }),
      new TableIndex({
        name: "idx_organization_invitations_organization_id_status",
        columnNames: ["organization_id", "status"],
      }),
      new TableIndex({
        name: "IDX_organization_invitations_token_hash",
        columnNames: ["token_hash"],
      }),
      new TableIndex({
        name: "IDX_organization_invitations_invited_by",
        columnNames: ["invited_by"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "organization_invitations", schema: "organization" }), true);
  }
}
