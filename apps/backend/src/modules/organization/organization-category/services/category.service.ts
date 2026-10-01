import { Injectable, NotFoundException } from "@nestjs/common";
import type { OrganizationCategory } from "../entities/category.entity";
import { OrganizationCategoryRepository } from "../repositories/category.repository";
import type { CategoryQueryDto, PaginatedCategoryData } from "@orgatick/contracts";

@Injectable()
export class OrganizationCategoryService {
  constructor(private readonly categoryRepository: OrganizationCategoryRepository) {}

  async findPaginated(query: CategoryQueryDto): Promise<PaginatedCategoryData> {
    const [items, total] = await this.categoryRepository.findPaginated(query);
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(): Promise<OrganizationCategory[]> {
    return await this.categoryRepository.findActiveCategories();
  }

  async findById(id: bigint): Promise<OrganizationCategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return category;
  }

  async findActiveById(id: bigint): Promise<OrganizationCategory | null> {
    return await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async findBySlug(slug: string): Promise<OrganizationCategory> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async findByIdAndLevel(id: bigint, level: number): Promise<OrganizationCategory> {
    const category = await this.categoryRepository.findByIdAndLevel(id, level);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' and level '${level}' not found`);
    }
    return category;
  }

  async findByParentIdLevelAndId(parentId: bigint, level: number, id: bigint): Promise<OrganizationCategory> {
    const category = await this.categoryRepository.findByParentIdLevelAndId(parentId, level, id);
    if (!category) {
      throw new NotFoundException(`Category with parent ID '${parentId}', level '${level}', and ID '${id}' not found`);
    }
    return category;
  }

  async validateCategoryAndSubCategory(parentId: bigint, subCategoryId: bigint): Promise<boolean> {
    const category = await this.findByIdAndLevel(parentId, 1);
    if (!category) {
      throw new NotFoundException(`Category with ID '${parentId}' not found or inactive`);
    }
    const subCategory = await this.findByIdAndLevel(subCategoryId, category.level + 1);
    if (!subCategory) {
      throw new NotFoundException(`Sub-category with ID '${subCategoryId}' not found or inactive`);
    }
    return true;
  }
}
