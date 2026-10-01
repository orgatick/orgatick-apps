import { type MigrationInterface, type QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddUserIdentityRelations1787813990285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKeys(new Table({ name: "user_accounts", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_ACCOUNTS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_security", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_SECURITY_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_verifications", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_VERIFICATIONS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_devices", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_DEVICES_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_sessions", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_SESSIONS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        name: "FK_USER_SESSIONS_DEVICE",
        columnNames: ["device_id"],
        referencedSchema: "identity",
        referencedTableName: "user_devices",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_login_attempts", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_LOGIN_ATTEMPTS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_passkeys", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_PASSKEYS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);

    await queryRunner.createForeignKeys(new Table({ name: "user_backup_codes", schema: "identity" }), [
      new TableForeignKey({
        name: "FK_USER_BACKUP_CODES_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      new Table({ name: "user_backup_codes", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_BACKUP_CODES_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_passkeys", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_PASSKEYS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_LOGIN_ATTEMPTS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_SESSIONS_DEVICE",
        columnNames: ["device_id"],
        referencedSchema: "identity",
        referencedTableName: "user_devices",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_SESSIONS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_devices", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_DEVICES_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_verifications", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_VERIFICATIONS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_security", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_SECURITY_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.dropForeignKey(
      new Table({ name: "user_accounts", schema: "identity" }),
      new TableForeignKey({
        name: "FK_USER_ACCOUNTS_USER",
        columnNames: ["user_id"],
        referencedSchema: "identity",
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );
  }
}
