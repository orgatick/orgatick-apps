import { type MigrationInterface, type QueryRunner, Table, TableIndex } from "typeorm";

export class AddUserIdentityIndexes1787813994773 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // users
    await queryRunner.createIndex(
      new Table({ name: "users", schema: "identity" }),
      new TableIndex({
        name: "IDX_USERS_EMAIL",
        columnNames: ["normalized_email"],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "users", schema: "identity" }),
      new TableIndex({
        name: "IDX_USERS_PHONE_NUMBER",
        columnNames: ["phone_number"],
      }),
    );

    // user_accounts
    await queryRunner.createIndex(
      new Table({ name: "user_accounts", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_ACCOUNTS_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_accounts", schema: "identity" }),
      new TableIndex({
        name: "UQ_USER_ACCOUNTS_PROVIDER_ACCOUNT",
        columnNames: ["provider", "provider_account_id"],
        isUnique: true,
      }),
    );

    // user_security
    // user_id is already the primary key.
    // PostgreSQL automatically indexes the primary key.

    // user_verifications
    await queryRunner.createIndex(
      new Table({ name: "user_verifications", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_VERIFICATIONS_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_verifications", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_VERIFICATIONS_EXPIRES_AT",
        columnNames: ["expires_at"],
      }),
    );

    // user_sessions
    await queryRunner.createIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_SESSIONS_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_SESSIONS_DEVICE_ID",
        columnNames: ["device_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_SESSIONS_EXPIRES_AT",
        columnNames: ["expires_at"],
      }),
    );

    // user_devices
    await queryRunner.createIndex(
      new Table({ name: "user_devices", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_DEVICES_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    // user_login_attempts
    await queryRunner.createIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_LOGIN_ATTEMPTS_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_LOGIN_ATTEMPTS_EMAIL",
        columnNames: ["email"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_LOGIN_ATTEMPTS_IP_ADDRESS",
        columnNames: ["ip_address"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_LOGIN_ATTEMPTS_ATTEMPTED_AT",
        columnNames: ["attempted_at"],
      }),
    );

    // user_passkeys
    await queryRunner.createIndex(
      new Table({ name: "user_passkeys", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_PASSKEYS_USER_ID",
        columnNames: ["user_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "user_passkeys", schema: "identity" }),
      new TableIndex({
        name: "UQ_USER_PASSKEYS_CREDENTIAL_ID",
        columnNames: ["credential_id"],
        isUnique: true,
      }),
    );

    // user_backup_codes
    await queryRunner.createIndex(
      new Table({ name: "user_backup_codes", schema: "identity" }),
      new TableIndex({
        name: "IDX_USER_BACKUP_CODES_USER_ID",
        columnNames: ["user_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      new Table({ name: "user_backup_codes", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_BACKUP_CODES_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_passkeys", schema: "identity" }),
      new TableIndex({ name: "UQ_USER_PASSKEYS_CREDENTIAL_ID", columnNames: ["credential_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_passkeys", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_PASSKEYS_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_LOGIN_ATTEMPTS_ATTEMPTED_AT", columnNames: ["attempted_at"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_LOGIN_ATTEMPTS_IP_ADDRESS", columnNames: ["ip_address"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_LOGIN_ATTEMPTS_EMAIL", columnNames: ["email"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_login_attempts", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_LOGIN_ATTEMPTS_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_devices", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_DEVICES_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_SESSIONS_EXPIRES_AT", columnNames: ["expires_at"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_SESSIONS_DEVICE_ID", columnNames: ["device_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_sessions", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_SESSIONS_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_verifications", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_VERIFICATIONS_EXPIRES_AT", columnNames: ["expires_at"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_verifications", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_VERIFICATIONS_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_accounts", schema: "identity" }),
      new TableIndex({ name: "UQ_USER_ACCOUNTS_PROVIDER_ACCOUNT", columnNames: ["provider", "provider_account_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "user_accounts", schema: "identity" }),
      new TableIndex({ name: "IDX_USER_ACCOUNTS_USER_ID", columnNames: ["user_id"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "users", schema: "identity" }),
      new TableIndex({ name: "IDX_USERS_PHONE_NUMBER", columnNames: ["phone_number"] }),
    );

    await queryRunner.dropIndex(
      new Table({ name: "users", schema: "identity" }),
      new TableIndex({ name: "IDX_USERS_EMAIL", columnNames: ["normalized_email"] }),
    );
  }
}
