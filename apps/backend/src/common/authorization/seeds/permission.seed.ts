import type { DataSource } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Permission } from "../entities/permission.entity";
import { PERMISSION_DEFINITIONS } from "../permissions";

export default class PermissionSeed implements Seeder {
  public async run(dataSource: DataSource, _factoryManager?: SeederFactoryManager): Promise<void> {
    const permissionRepo = dataSource.getRepository(Permission);

    console.log(`Starting Permissions seeding (${PERMISSION_DEFINITIONS.length} definitions)...`);

    const records: QueryDeepPartialEntity<Permission>[] = PERMISSION_DEFINITIONS.map((def) => ({
      key: def.key,
      name: def.name,
      description: def.description,
      resource: def.resource,
      action: def.action,
      scope: def.scope,
      category: def.category,
      isActive: true,
    }));

    const chunkSize = 100;
    let totalSeeded = 0;

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      await permissionRepo.upsert(chunk, ["key"]);
      totalSeeded += chunk.length;
    }

    console.log(`Successfully seeded ${totalSeeded} permissions.`);
  }
}
