import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class CreateAdministrativeDivisionsTable1788934131907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "administrative_divisions",
        schema: "address",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "country_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "parent_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "level",
            type: "smallint",
            isNullable: false,
          },
          {
            name: "code",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "name_ascii",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "geoname_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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

    // Country → Administrative Division
    await queryRunner.createForeignKey(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableForeignKey({
        name: "FK_administrative_divisions_country",
        columnNames: ["country_id"],
        referencedSchema: "address",
        referencedTableName: "countries",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    );

    // Self-reference: Admin 2 → Admin 1
    await queryRunner.createForeignKey(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableForeignKey({
        name: "FK_administrative_divisions_parent",
        columnNames: ["parent_id"],
        referencedSchema: "address",
        referencedTableName: "administrative_divisions",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    );

    // GeoNames ID is globally unique
    await queryRunner.createUniqueConstraint(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableUnique({
        name: "UQ_administrative_divisions_geoname_id",
        columnNames: ["geoname_id"],
      }),
    );

    // Code is unique only inside a country + level
    await queryRunner.createUniqueConstraint(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableUnique({
        name: "UQ_administrative_divisions_country_level_code",
        columnNames: ["country_id", "level", "code"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableIndex({
        name: "IDX_administrative_divisions_country_id",
        columnNames: ["country_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableIndex({
        name: "IDX_administrative_divisions_parent_id",
        columnNames: ["parent_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableIndex({
        name: "IDX_administrative_divisions_level",
        columnNames: ["level"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "administrative_divisions", schema: "address" }),
      new TableIndex({
        name: "IDX_administrative_divisions_name",
        columnNames: ["name"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "administrative_divisions", schema: "address" }), true);
  }
}
