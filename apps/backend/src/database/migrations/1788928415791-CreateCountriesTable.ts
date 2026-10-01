import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateCountriesTable1788928415791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema("address", true);

    await queryRunner.createTable(
      new Table({
        name: "countries",
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
            name: "code",
            type: "char",
            length: "2",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "code3",
            type: "char",
            length: "3",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "numeric_code",
            type: "char",
            length: "3",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "capital",
            type: "varchar",
            length: "150",
            isNullable: true,
          },
          {
            name: "currency_code",
            type: "char",
            length: "3",
            isNullable: true,
          },
          {
            name: "currency_name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "phone_code",
            type: "varchar",
            length: "30",
            isNullable: true,
          },
          {
            name: "postal_code_regex",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "geoname_id",
            type: "bigint",
            isUnique: true,
            isNullable: true,
          },
          {
            name: "tld",
            type: "varchar",
            length: "10",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "countries", schema: "address" }), true);
  }
}
