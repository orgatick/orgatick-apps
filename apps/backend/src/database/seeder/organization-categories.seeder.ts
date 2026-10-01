import type { DataSource } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import categoryData from "./data/organization-category.json";
import { OrganizationCategory } from "@/modules/organization";

interface CategorySeedNode {
  name: string;
  slug: string;
  level: number;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  children?: CategorySeedNode[];
}

export default class OrganizationCategoriesSeeder implements Seeder {
  public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    const repository = dataSource.getRepository(OrganizationCategory);
    const categories = categoryData as CategorySeedNode[];

    console.log(`Starting Organization Categories seeding (${categories.length} top-level categories)...`);

    let totalSeeded = 0;

    // 1. Seed Level 1 (Top-Level) Categories
    for (let i = 0; i < categories.length; i++) {
      const parentItem = categories[i];
      await repository.upsert(
        {
          name: parentItem.name,
          slug: parentItem.slug,
          level: parentItem.level ?? 1,
          description: parentItem.description ?? null,
          isActive: parentItem.isActive ?? true,
          sortOrder: parentItem.sortOrder ?? i + 1,
          parentId: null,
        },
        ["slug"],
      );
      totalSeeded++;
    }

    // 2. Fetch all top-level categories to resolve their parent IDs
    const parentRecords = await repository.find({
      where: { level: 1 },
      select: { id: true, slug: true },
    });

    const parentMap = new Map<string, bigint>();
    for (const record of parentRecords) {
      parentMap.set(record.slug, BigInt(record.id));
    }

    // 3. Seed Level 2 (Child) Categories
    const childUpserts: Partial<OrganizationCategory>[] = [];

    for (const parentItem of categories) {
      const parentId = parentMap.get(parentItem.slug);

      if (!parentId) {
        console.warn(`Parent category with slug '${parentItem.slug}' not found in database. Skipping children.`);
        continue;
      }

      if (Array.isArray(parentItem.children) && parentItem.children.length > 0) {
        for (let j = 0; j < parentItem.children.length; j++) {
          const childItem = parentItem.children[j];
          childUpserts.push({
            name: childItem.name,
            slug: childItem.slug,
            level: childItem.level ?? 2,
            description: childItem.description ?? null,
            isActive: childItem.isActive ?? true,
            sortOrder: childItem.sortOrder ?? j + 1,
            parentId,
          });
        }
      }
    }

    if (childUpserts.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < childUpserts.length; i += chunkSize) {
        const chunk = childUpserts.slice(i, i + chunkSize);
        await repository.upsert(chunk, ["slug"]);
      }
      totalSeeded += childUpserts.length;
    }

    console.log(
      `Successfully seeded ${totalSeeded} organization categories (${categories.length} parents, ${childUpserts.length} children).`,
    );
  }
}
