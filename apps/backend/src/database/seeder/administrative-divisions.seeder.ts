import { type DataSource, In } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import admin1Data from "./data/admin1Codes.json";
import admin2Data from "./data/admin2Codes.json";
import { AdministrativeDivision } from "../../modules/address/entities/administrative-divisions.entity";
import { Country } from "../../modules/address/entities/countries.entity";

interface AdminSeed {
  code: string;
  name: string;
  nameAscii: string;
  geonameId: number;
}

export default class AdministrativeDivisionsSeeder implements Seeder {
  public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    const countryRepo = dataSource.getRepository(Country);
    const adminDivisionRepo = dataSource.getRepository(AdministrativeDivision);

    // 1. Fetch available/active countries in database
    const countries = await countryRepo.find({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
      },
    });

    if (countries.length === 0) {
      console.log("No active countries found in database. Skipping administrative divisions seeding.");
      return;
    }

    const countryMap = new Map<string, bigint>();
    for (const country of countries) {
      countryMap.set(country.code.toUpperCase(), BigInt(country.id));
    }

    console.log(
      `Found ${countries.length} active countries. Seeding administrative divisions only for available countries...`,
    );

    // 2. Seed Level 1 Administrative Divisions only for available countries
    const admin1List = admin1Data as AdminSeed[];
    const level1Records: Partial<AdministrativeDivision>[] = [];

    for (const item of admin1List) {
      const [countryIso, ...rest] = item.code.split(".");
      const countryId = countryMap.get(countryIso.toUpperCase());

      if (!countryId) {
        continue;
      }

      const code = rest.join(".");

      level1Records.push({
        countryId,
        parentId: null,
        level: 1,
        code,
        name: item.name,
        nameAscii: item.nameAscii,
        geonameId: item.geonameId,
        isActive: true,
      });
    }

    const chunkSize = 1000;
    if (level1Records.length > 0) {
      for (let i = 0; i < level1Records.length; i += chunkSize) {
        const chunk = level1Records.slice(i, i + chunkSize);
        await adminDivisionRepo.upsert(chunk, ["geonameId"]);
      }
      console.log(`Seeded ${level1Records.length} administrative divisions (level 1)`);
    } else {
      console.log("No level 1 administrative divisions found for available countries.");
    }

    // 3. Build a lookup map for Level 1 divisions: `${countryId}:${admin1Code}` -> DB ID
    const countryIds = Array.from(countryMap.values());
    const level1Divisions = await adminDivisionRepo.find({
      where: {
        level: 1,
        countryId: In(countryIds),
      },
      select: {
        id: true,
        countryId: true,
        code: true,
      },
    });

    const level1Map = new Map<string, bigint>();
    for (const div of level1Divisions) {
      level1Map.set(`${div.countryId}:${div.code}`, BigInt(div.id));
    }

    // 4. Seed Level 2 Administrative Divisions only for available countries
    const admin2List = admin2Data as AdminSeed[];
    const level2Records: Partial<AdministrativeDivision>[] = [];

    for (const item of admin2List) {
      const [countryIso, admin1Code, admin2Code] = item.code.split(".");
      const countryId = countryMap.get(countryIso.toUpperCase());

      if (!countryId) {
        continue;
      }

      const parentId = level1Map.get(`${countryId}:${admin1Code}`) ?? null;
      const code = `${admin1Code}.${admin2Code}`;

      level2Records.push({
        countryId,
        parentId,
        level: 2,
        code,
        name: item.name,
        nameAscii: item.nameAscii,
        geonameId: item.geonameId,
        isActive: true,
      });
    }

    if (level2Records.length > 0) {
      for (let i = 0; i < level2Records.length; i += chunkSize) {
        const chunk = level2Records.slice(i, i + chunkSize);
        await adminDivisionRepo.upsert(chunk, ["geonameId"]);
      }
      console.log(`Seeded ${level2Records.length} administrative divisions (level 2)`);
    } else {
      console.log("No level 2 administrative divisions found for available countries.");
    }
  }
}
