import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AddressesController } from "./controllers/addresses.controller";
import { AdministrativeDivisionsController } from "./controllers/administrative-divisions.controller";
import { CitiesController } from "./controllers/cities.controller";
import { CountriesController } from "./controllers/countries.controller";
import { Address } from "./entities/addresses.entity";
import { AdministrativeDivision } from "./entities/administrative-divisions.entity";
import { City } from "./entities/cities.entity";
import { Country } from "./entities/countries.entity";
import { AddressesRepository } from "./repositories/addresses.repository";
import { AdministrativeDivisionsRepository } from "./repositories/administrative-divisions.repository";
import { CitiesRepository } from "./repositories/cities.repository";
import { CountriesRepository } from "./repositories/countries.repository";
import { AddressesService } from "./services/addresses.service";
import { AdministrativeDivisionsService } from "./services/administrative-divisions.service";
import { CitiesService } from "./services/cities.service";
import { CountriesService } from "./services/countries.service";

@Module({
  imports: [TypeOrmModule.forFeature([Address, Country, AdministrativeDivision, City])],
  controllers: [AddressesController, CountriesController, AdministrativeDivisionsController, CitiesController],
  providers: [
    AddressesService,
    CountriesService,
    AdministrativeDivisionsService,
    CitiesService,
    AddressesRepository,
    CountriesRepository,
    AdministrativeDivisionsRepository,
    CitiesRepository,
  ],
  exports: [
    AddressesService,
    CountriesService,
    AdministrativeDivisionsService,
    CitiesService,
    AddressesRepository,
    CountriesRepository,
    AdministrativeDivisionsRepository,
    CitiesRepository,
    TypeOrmModule,
  ],
})
export class AddressModule {}
