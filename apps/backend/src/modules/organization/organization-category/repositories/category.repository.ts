import { Injectable } from "@nestjs/common";
import { DataSource, type FindOptionsOrder, type FindOptionsWhere, ILike, IsNull, Repository } from "typeorm";

import { OrganizationCategory } from "../entities/category.entity";
import type { CategoryQueryDto } from "@orgatick/contracts";

@Injectable()
export class OrganizationCategoryRepository extends Repository<OrganizationCategory> {
  constructor(dataSource: DataSource) {
    super(OrganizationCategory, dataSource.createEntityManager());
  }

  async findPaginated(query: CategoryQueryDto): Promise<[OrganizationCategory[], number]> {
    const skip = (query.page - 1) * query.limit;

    const baseWhere: FindOptionsWhere<OrganizationCategory> = {};

    if (query.isActive !== undefined) baseWhere.isActive = query.isActive;

    if (query.level !== undefined) baseWhere.level = query.level;

    if (query.parentId !== undefined) {
      baseWhere.parentId = BigInt(query.parentId);
    } else if (query.rootOnly) {
      baseWhere.parentId = IsNull();
    }

    let where: FindOptionsWhere<OrganizationCategory> | FindOptionsWhere<OrganizationCategory>[] = baseWhere;

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = `%${query.search.trim()}%`;
      where = [
        { ...baseWhere, name: ILike(searchTerm) },
        { ...baseWhere, slug: ILike(searchTerm) },
        { ...baseWhere, description: ILike(searchTerm) },
      ];
    }

    const order: FindOptionsOrder<OrganizationCategory> = {
      [query.sortBy]: query.sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC",
    };

    return await this.findAndCount({
      where,
      order,
      skip,
      take: query.limit,
      relations: {
        children: query.includeChildren ?? false,
        parent: query.includeParent ?? false,
      },
    });
  }

  async findActiveCategories(): Promise<OrganizationCategory[]> {
    return this.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", name: "ASC" },
      relations: { children: true },
    });
  }

  async findById(id: bigint): Promise<OrganizationCategory | null> {
    return this.findOne({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<OrganizationCategory | null> {
    return this.findOne({
      where: { slug },
    });
  }

  async findByIdAndLevel(id: bigint, level: number): Promise<OrganizationCategory | null> {
    return this.findOne({
      where: { id, level, isActive: true },
      relations: { parent: true, children: true },
    });
  }

  async findByParentIdLevelAndId(parentId: bigint, level: number, id: bigint): Promise<OrganizationCategory | null> {
    return this.findOne({
      where: { parentId, level, id },
      relations: { parent: true, children: true },
    });
  }
}
