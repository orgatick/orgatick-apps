# Entity Response Modeling Guidelines

When modeling API response schemas for domain entities in `@orgatick/contracts`:

## 1. Guideline Checklist

- **IDs**: Use string or validated identifier schemas.
- **Nullable vs Optional**:
  - Fields in API responses that can be null should use `.nullable()`.
  - Fields that might not be returned in partial projections should use `.optional()`.
- **Date/Time**: Represent timestamps as ISO 8601 strings with `z.string().datetime()` on the response contract boundary.
- **Export standard suite**:
  For each entity `Entity`:
  - `EntityResponseSchema` & `EntityResponse`
  - `SingleEntityResponseSchema` & `SingleEntityResponse`
  - `PaginatedEntityDataSchema` & `PaginatedEntityData`
  - `PaginatedEntityResponseSchema` & `PaginatedEntityResponse`

## 2. Standard Pattern Example

```typescript
import { z } from "zod";
import {
  createApiResponseSchema,
  createPaginatedApiResponseSchema,
  createPaginatedDataSchema,
} from "../../common/index.js";

export const CategoryResponseSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  level: z.number().int().positive(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

export const PaginatedCategoryDataSchema = createPaginatedDataSchema(CategoryResponseSchema);
export type PaginatedCategoryData = z.infer<typeof PaginatedCategoryDataSchema>;

export const SingleCategoryResponseSchema = createApiResponseSchema(CategoryResponseSchema);
export type SingleCategoryResponse = z.infer<typeof SingleCategoryResponseSchema>;

export const PaginatedCategoryResponseSchema = createPaginatedApiResponseSchema(CategoryResponseSchema);
export type PaginatedCategoryResponse = z.infer<typeof PaginatedCategoryResponseSchema>;
```
