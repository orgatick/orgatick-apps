import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { join } from "node:path";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { addTransactionalDataSource } from "typeorm-transactional";

export const ormConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: "postgres",
    host: config.get<string>("DATABASE_HOST"),
    port: config.get<number>("DATABASE_PORT"),
    username: config.get<string>("DATABASE_USER"),
    password: config.get<string>("DATABASE_PASSWORD"),
    database: config.get<string>("DATABASE_NAME"),
    entities: [join(__dirname, "..", "..", "**", "*.entity.{js,ts}")],
    migrations: [join(__dirname, "..", "migrations", "*.{js,ts}")],

    ssl: config.get<string>("DATABASE_SSL") === "false" ? false : { rejectUnauthorized: false },

    autoLoadEntities: true,

    logging: false,
    migrationsRun: false,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  }),
  async dataSourceFactory(options) {
    if (!options) throw new Error("Invalid options passed");
    return Promise.resolve(addTransactionalDataSource(new DataSource(options)));
  },
};
