import { AdministrativeDivision } from "@/modules/address/entities/administrative-divisions.entity";
import { City } from "@/modules/address/entities/cities.entity";
import { Country } from "@/modules/address/entities/countries.entity";
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { type DataSource, In } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";

interface CityJsonItem {
  geonameId: number;
  name: string;
  nameAscii: string;
  alternateNames?: string[];
  latitude: number;
  longitude: number;
  featureClass: string;
  featureCode: string;
  countryCode: string;
  alternateCountryCodes?: string[];
  admin1Code: string | null;
  admin2Code: string | null;
  admin3Code: string | null;
  admin4Code: string | null;
  population: number | null;
  elevation?: number | null;
  dem?: number | null;
  timezone: string | null;
  modificationDate: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export default class CitiesSeeder implements Seeder {
  public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    const countryRepo = dataSource.getRepository(Country);
    const adminDivisionRepo = dataSource.getRepository(AdministrativeDivision);
    const cityRepo = dataSource.getRepository(City);

    console.log("Loading active countries for city mapping...");
    const countries = await countryRepo.find({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
      },
    });

    if (countries.length === 0) {
      console.log("No active countries found in database. Skipping cities seeding.");
      return;
    }

    const countryMap = new Map<string, bigint>();
    const countryIdToCode = new Map<string, string>();
    for (const c of countries) {
      const id = BigInt(c.id);
      const codeUpper = c.code.toUpperCase();
      countryMap.set(codeUpper, id);
      countryIdToCode.set(id.toString(), codeUpper);
    }

    console.log(`Found ${countries.length} active countries. Loading administrative divisions for city mapping...`);
    const countryIds = Array.from(countryMap.values());
    const adminDivisions = await adminDivisionRepo.find({
      where: {
        countryId: In(countryIds),
      },
      select: {
        id: true,
        countryId: true,
        level: true,
        code: true,
      },
    });

    const admin1Map = new Map<string, bigint>();
    const admin2Map = new Map<string, bigint>();

    for (const div of adminDivisions) {
      const countryCode = countryIdToCode.get(div.countryId.toString());
      if (!countryCode) continue;

      if (div.level === 1) {
        admin1Map.set(`${countryCode}:${div.code}`, BigInt(div.id));
      } else if (div.level === 2) {
        admin2Map.set(`${countryCode}:${div.code}`, BigInt(div.id));
      }
    }

    console.log("Reading cities dataset...");
    const gzPath = path.join(__dirname, "data/cities500.json.gz");
    const jsonPath = path.join(__dirname, "data/cities500.json");

    let fileContent: string;
    if (fs.existsSync(gzPath)) {
      const compressedBuffer = fs.readFileSync(gzPath);
      fileContent = zlib.gunzipSync(compressedBuffer).toString("utf8");
    } else if (fs.existsSync(jsonPath)) {
      fileContent = fs.readFileSync(jsonPath, "utf8");
    } else {
      throw new Error("Cities dataset not found at cities500.json.gz or cities500.json");
    }

    const citiesData: CityJsonItem[] = JSON.parse(fileContent);

    console.log(`Filtering cities for active countries...`);
    const records: Partial<City>[] = [];

    for (const item of citiesData) {
      const countryCode = item.countryCode?.toUpperCase();
      const countryId = countryMap.get(countryCode);
      if (!countryId) {
        continue;
      }

      const admin1Id = item.admin1Code ? (admin1Map.get(`${countryCode}:${item.admin1Code}`) ?? null) : null;

      const admin2Id =
        item.admin1Code && item.admin2Code
          ? (admin2Map.get(`${countryCode}:${item.admin1Code}.${item.admin2Code}`) ?? null)
          : null;

      const slug = slugify(item.nameAscii || item.name) || null;

      records.push({
        geonameId: item.geonameId,
        countryId,
        admin1Id,
        admin2Id,
        name: item.name,
        nameAscii: item.nameAscii,
        slug,
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone ?? null,
        modificationDate: item.modificationDate ? new Date(item.modificationDate) : null,
        isActive: true,
      });
    }

    if (records.length === 0) {
      console.log("No matching cities found for available countries.");
      return;
    }

    const chunkSize = 2000;
    const totalChunks = Math.ceil(records.length / chunkSize);

    console.log(`Seeding ${records.length} cities in ${totalChunks} chunks...`);

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      await cityRepo.upsert(chunk, ["geonameId"]);

      const chunkIndex = Math.floor(i / chunkSize) + 1;
      if (chunkIndex % 10 === 0 || chunkIndex === totalChunks) {
        console.log(`Seeded chunk ${chunkIndex} of ${totalChunks}`);
      }
    }

    console.log(`Successfully seeded ${records.length} cities`);
  }
}
