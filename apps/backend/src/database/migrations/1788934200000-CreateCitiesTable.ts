import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class CreateCitiesTable1788934200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "cities",
        schema: "address",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "geoname_id", type: "bigint", isNullable: false },
          { name: "country_id", type: "bigint", isNullable: false },
          { name: "admin1_id", type: "bigint", isNullable: true },
          { name: "admin2_id", type: "bigint", isNullable: true },
          { name: "name", type: "varchar", length: "150", isNullable: false },
          { name: "name_ascii", type: "varchar", length: "150", isNullable: false },
          { name: "slug", type: "varchar", length: "180", isNullable: true },
          { name: "latitude", type: "decimal", precision: 10, scale: 7, isNullable: false },
          { name: "longitude", type: "decimal", precision: 11, scale: 7, isNullable: false },
          { name: "timezone", type: "varchar", length: "100", isNullable: true },
          { name: "modification_date", type: "date", isNullable: true },
          { name: "is_active", type: "boolean", default: true, isNullable: false },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", isNullable: false },
        ],
      }),
      true,
    );

    // Country → City
    await queryRunner.createForeignKey(
      new Table({ name: "cities", schema: "address" }),
      new TableForeignKey({
        name: "FK_cities_country",
        columnNames: ["country_id"],
        referencedSchema: "address",
        referencedTableName: "countries",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    );

    // Admin1 → City
    await queryRunner.createForeignKey(
      new Table({ name: "cities", schema: "address" }),
      new TableForeignKey({
        name: "FK_cities_admin1",
        columnNames: ["admin1_id"],
        referencedSchema: "address",
        referencedTableName: "administrative_divisions",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );

    // Admin2 → City
    await queryRunner.createForeignKey(
      new Table({ name: "cities", schema: "address" }),
      new TableForeignKey({
        name: "FK_cities_admin2",
        columnNames: ["admin2_id"],
        referencedSchema: "address",
        referencedTableName: "administrative_divisions",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );

    // GeoNames ID unique constraint
    await queryRunner.createUniqueConstraint(
      new Table({ name: "cities", schema: "address" }),
      new TableUnique({
        name: "UQ_cities_geoname_id",
        columnNames: ["geoname_id"],
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_country_id",
        columnNames: ["country_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_admin1_id",
        columnNames: ["admin1_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_admin2_id",
        columnNames: ["admin2_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_name",
        columnNames: ["name"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_name_ascii",
        columnNames: ["name_ascii"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "cities", schema: "address" }),
      new TableIndex({
        name: "IDX_cities_slug",
        columnNames: ["slug"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "cities", schema: "address" }), true);
  }
}
