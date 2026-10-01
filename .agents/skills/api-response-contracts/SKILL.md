---
name: api-response-contracts
description: >
  Standard patterns, schemas, and best practices for building reusable API response
  contracts in Orgatick. Covers standard response envelopes ({ success, statusCode, data, timestamp }),
  paginated response structures ({ items, meta }), generic Zod schema factories, type inference,
  and entity response modeling. Triggers on: API response schemas, response envelopes, pagination contracts,
  createApiResponseSchema, createPaginatedApiResponseSchema, or creating single/list response types.
license: MIT
user-invocable: false
agentic: false
compatibility: "TypeScript ^5.5 projects using zod ^4.0.0 or later"
metadata:
  author: Orgatick Team
  version: 1.0.0
  tags: api-response, envelope, pagination, contracts, zod, typescript, schema
---

# API Response Contracts Skill

This skill defines the standard architecture and guidelines for modeling API responses across Orgatick services and client contracts.

## Key Principles

1. **Uniform Envelope Structure**: All API endpoints must return a predictable envelope:
   - `success`: `boolean` (default: `true`)
   - `statusCode`: `number` (HTTP status code, default: `200`)
   - `data`: `T` (the generic payload)
   - `timestamp`: ISO 8601 string (`YYYY-MM-DDTHH:mm:ss.sssZ`)

2. **Standard Pagination**:
   - Paginated datasets wrap items inside `data.items` (array) and pagination metadata inside `data.meta` (`total`, `page`, `limit`, `totalPages`).

3. **Schema Reusability**:
   - Base envelope schemas are factory functions (`createApiResponseSchema`, `createPaginatedApiResponseSchema`) accepting any Zod item/data schema.

---

## Quick Reference

### 1. Envelope Schema Factories

```typescript
import { z } from "zod";
import {
  createApiResponseSchema,
  createPaginatedApiResponseSchema,
  createPaginatedDataSchema,
  PaginationMetaSchema,
} from "@orgatick/contracts";
```

### 2. Creating an Entity Response Contract

When defining a new domain entity response (e.g., `Category`, `Product`, `Order`):

```typescript
import { z } from "zod";
import {
  createApiResponseSchema,
  createPaginatedApiResponseSchema,
  createPaginatedDataSchema,
} from "../../common/index.js";

// 1. Define Entity Schema
export const ItemResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

// 2. Paginated Data Schema ({ items: ItemResponse[], meta: PaginationMeta })
export const PaginatedItemDataSchema = createPaginatedDataSchema(ItemResponseSchema);
export type PaginatedItemData = z.infer<typeof PaginatedItemDataSchema>;

// 3. Single Item API Response ({ success, statusCode, data: ItemResponse, timestamp })
export const SingleItemResponseSchema = createApiResponseSchema(ItemResponseSchema);
export type SingleItemResponse = z.infer<typeof SingleItemResponseSchema>;

// 4. Paginated List API Response ({ success, statusCode, data: PaginatedItemData, timestamp })
export const PaginatedItemResponseSchema = createPaginatedApiResponseSchema(ItemResponseSchema);
export type PaginatedItemResponse = z.infer<typeof PaginatedItemResponseSchema>;
```

---

## Detailed References

- [Response Envelope Architecture](references/response-envelope.md)
- [Pagination Schema Guidelines](references/pagination-patterns.md)
- [Entity Response Modeling](references/entity-responses.md)

## Code Examples

- [Single Item Response Example](examples/single-response.example.ts)
- [Paginated Response Example](examples/paginated-response.example.ts)
