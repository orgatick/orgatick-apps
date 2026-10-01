# Response Envelope Architecture

All HTTP JSON responses in Orgatick follow a standard envelope wrapper structure.

## Structure Definition

```typescript
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string; // ISO 8601 string
}
```

## Schema Factory

The `createApiResponseSchema` factory allows generic wrapping of any data payload schema:

```typescript
import { z } from "zod";

export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().default(true),
    statusCode: z.number().int().default(200),
    data: dataSchema,
    timestamp: z.string().datetime("timestamp must be a valid ISO 8601 datetime string"),
  });
```

## Envelope Rules

1. **`success`**: `true` for 2xx responses, `false` for 4xx/5xx responses.
2. **`statusCode`**: Matches the HTTP response status code (e.g. 200, 201).
3. **`data`**: Contains the payload. For list endpoints, wrap in `PaginatedData<T>`. For single entity endpoints, pass the entity directly.
4. **`timestamp`**: Must be a valid ISO 8601 UTC timestamp string (e.g., `2026-09-21T06:45:36.787Z`).
