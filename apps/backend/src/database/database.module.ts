import { TypeOrmModule } from "@nestjs/typeorm";
import { ormConfig } from "./config/orm.config";

export const databaseModule = TypeOrmModule.forRootAsync(ormConfig);
