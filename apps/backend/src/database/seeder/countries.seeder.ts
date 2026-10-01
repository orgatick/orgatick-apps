import type { DataSource } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import countriesData from "./data/countries.json";
import { Country } from "@/modules/address/entities/countries.entity";

interface CountrySeed {
  iso: string;
  iso3: string;
  numericCode: string;
  name: string;
  capital: string | null;
  area: number | null;
  population: number | null;
  continent: string | null;
  tld: string | null;
  currencyCode: string | null;
  currencyName: string | null;
  phoneCode: string | null;
  postalCodeFormat: string | null;
  postalCodeRegex: string | null;
  languages: string[];
  geonameId: number | null;
  neighbours: string[];
  isOperational?: boolean;
}

export default class CountriesSeeder implements Seeder {
  public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    const repository = dataSource.getRepository(Country);
    let countries = (countriesData as CountrySeed[]).filter((c) => c.isOperational === true);

    const operationalEnv = process.env.OPERATIONAL_COUNTRIES;
    if (operationalEnv && operationalEnv.trim().length > 0) {
      const allowedCodes = new Set(
        operationalEnv
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
      );
      countries = countries.filter(
        (c) => allowedCodes.has(c.iso.toUpperCase()) || allowedCodes.has(c.iso3.toUpperCase()),
      );
    }

    console.log(`Found ${countries.length} operational countries to seed.`);

    for (const data of countries) {
      await repository.upsert(
        {
          code: data.iso,
          code3: data.iso3,
          numericCode: data.numericCode,
          name: data.name,
          capital: data.capital,
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          phoneCode: data.phoneCode,
          postalCodeRegex: data.postalCodeRegex,
          geonameId: data.geonameId,
          tld: data.tld,
          isActive: true,
        },
        ["code"],
      );
    }

    console.log(`Seeded ${countries.length} operational countries`);
  }
}
