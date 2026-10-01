import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationCategory } from "./entities/category.entity";
import { OrganizationCategoryController } from "./controllers/category.controller";
import { OrganizationCategoryRepository } from "./repositories/category.repository";
import { OrganizationCategoryService } from "./services/category.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationCategory])],
  controllers: [OrganizationCategoryController],
  providers: [OrganizationCategoryService, OrganizationCategoryRepository],
  exports: [OrganizationCategoryService, TypeOrmModule],
})
export class OrganizationCategoryModule {}
