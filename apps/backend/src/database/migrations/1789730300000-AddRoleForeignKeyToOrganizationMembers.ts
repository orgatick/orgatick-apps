import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

/**
 * Adds the role_id relation on organization_members referencing authorization.roles.
 * Runs after the roles table exists (created at 1789730232093).
 */
export class AddRoleForeignKeyToOrganizationMembers1789730300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      new Table({ name: "organization_members", schema: "organization" }),
      new TableForeignKey({
        name: "FK_organization_members_role_id",
        columnNames: ["role_id"],
        referencedSchema: "authorization",
        referencedTableName: "roles",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      new Table({ name: "organization_members", schema: "organization" }),
      "FK_organization_members_role_id",
    );
  }
}
