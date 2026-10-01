import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateAddressesTable1788934300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "addresses",
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
            name: "uuid",
            type: "uuid",
            isUnique: true,
            isNullable: false,
            default: "gen_random_uuid()",
          },
          {
            name: "country_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "division_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "city_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "area_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "address_line_1",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "address_line_2",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "landmark",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "postal_code",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "latitude",
            type: "decimal",
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: "longitude",
            type: "decimal",
            precision: 11,
            scale: 7,
            isNullable: true,
          },
          {
            name: "formatted_address",
            type: "varchar",
            length: "500",
            isNullable: true,
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

    await queryRunner.createForeignKey(
      new Table({ name: "addresses", schema: "address" }),
      new TableForeignKey({
        name: "FK_addresses_country",
        columnNames: ["country_id"],
        referencedSchema: "address",
        referencedTableName: "countries",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      new Table({ name: "addresses", schema: "address" }),
      new TableForeignKey({
        name: "FK_addresses_division",
        columnNames: ["division_id"],
        referencedSchema: "address",
        referencedTableName: "administrative_divisions",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      new Table({ name: "addresses", schema: "address" }),
      new TableForeignKey({
        name: "FK_addresses_city",
        columnNames: ["city_id"],
        referencedSchema: "address",
        referencedTableName: "cities",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "addresses", schema: "address" }),
      new TableIndex({
        name: "IDX_addresses_country_id",
        columnNames: ["country_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "addresses", schema: "address" }),
      new TableIndex({
        name: "IDX_addresses_division_id",
        columnNames: ["division_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "addresses", schema: "address" }),
      new TableIndex({
        name: "IDX_addresses_city_id",
        columnNames: ["city_id"],
      }),
    );

    await queryRunner.createIndex(
      new Table({ name: "addresses", schema: "address" }),
      new TableIndex({
        name: "IDX_addresses_postal_code",
        columnNames: ["postal_code"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "addresses", schema: "address" }), true);
  }
}
