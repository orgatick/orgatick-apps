# Pagination Patterns

Orgatick uses a standard 1-based page and limit pagination format.

## Metadata Structure

```typescript
export interface PaginationMeta {
  total: number;      // Total number of records across all pages
  page: number;       // Current page number (>= 1)
  limit: number;      // Items per page (>= 1)
  totalPages: number; // Math.ceil(total / limit)
}
```

## Schema Definitions

```typescript
import { z } from "zod";

export const PaginationMetaSchema = z.object({
  total: z.number().int("Total must be an integer").nonnegative("Total cannot be negative"),
  page: z.number().int("Page must be an integer").positive("Page must be positive"),
  limit: z.number().int("Limit must be an integer").positive("Limit must be positive"),
  totalPages: z.number().int("Total pages must be an integer").nonnegative("Total pages cannot be negative"),
});

export const createPaginatedDataSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

export const createPaginatedApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  createApiResponseSchema(createPaginatedDataSchema(itemSchema));
```

## Example Payload

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "Technology & Software"
      }
    ],
    "meta": {
      "total": 109,
      "page": 1,
      "limit": 5,
      "totalPages": 22
    }
  },
  "timestamp": "2026-09-21T06:50:10.304Z"
}
```
