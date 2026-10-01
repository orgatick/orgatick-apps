import { type SingleCategoryResponse, SingleCategoryResponseSchema } from "@orgatick/contracts";

// Sample single category JSON payload
const rawCategoryPayload = {
  success: true,
  statusCode: 200,
  data: {
    id: "11",
    parentId: null,
    name: "Manufacturing, Logistics & Construction",
    slug: "manufacturing-logistics-construction",
    level: 1,
    description: "Manufacturing plants, transport, freight, warehousing, and construction.",
    isActive: true,
    sortOrder: 11,
    createdAt: "2026-09-21T00:46:03.899Z",
    updatedAt: "2026-09-21T00:46:03.899Z",
  },
  timestamp: "2026-09-21T06:45:36.787Z",
};

// Parse and validate response
const response: SingleCategoryResponse = SingleCategoryResponseSchema.parse(rawCategoryPayload);
console.log("Validated category:", response.data.name);
