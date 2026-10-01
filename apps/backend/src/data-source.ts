import "dotenv/config";
import { join } from "node:path";
import { DataSource, type DataSourceOptions } from "typeorm";
import type { SeederOptions } from "typeorm-extension";
import { addTransactionalDataSource, initializeTransactionalContext, StorageDriver } from "typeorm-transactional";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import CountriesSeeder from "./database/seeder/countries.seeder";
import AdministrativeDivisionsSeeder from "./database/seeder/administrative-divisions.seeder";
import CitiesSeeder from "./database/seeder/cities.seeder";
import OrganizationCategoriesSeeder from "./database/seeder/organization-categories.seeder";
import PermissionsSeeder from "./database/seeder/permissions.seeder";
import RolesSeeder from "./database/seeder/roles.seeder";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },

  entities: [join(__dirname, "**/*.entity.{ts,js}")],
  migrations: [join(__dirname, "database/migrations/*.{ts,js}")],

  seeds: [
    CountriesSeeder,
    AdministrativeDivisionsSeeder,
    CitiesSeeder,
    OrganizationCategoriesSeeder,
    PermissionsSeeder,
    RolesSeeder,
  ],
  factories: [],

  synchronize: false,
  logging: false,

  namingStrategy: new SnakeNamingStrategy(),
} as DataSourceOptions & SeederOptions);

initializeTransactionalContext({
  storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
});

addTransactionalDataSource(dataSource);

export default dataSource;
