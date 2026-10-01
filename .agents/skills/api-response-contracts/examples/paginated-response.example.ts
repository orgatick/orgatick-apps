import { PaginatedCategoryResponseSchema, type PaginatedCategoryResponse } from "@orgatick/contracts";

// Sample paginated categories JSON payload
const rawPaginatedPayload = {
  success: true,
  statusCode: 200,
  data: {
    items: [
      {
        id: "1",
        parentId: null,
        name: "Technology & Software",
        slug: "technology-software",
        level: 1,
        description: "Technology companies, software platforms, IT consulting, and digital products.",
        isActive: true,
        sortOrder: 1,
        createdAt: "2026-09-21T00:46:03.247Z",
        updatedAt: "2026-09-21T00:46:03.247Z",
      },
      {
        id: "18",
        parentId: "1",
        name: "Software & SaaS",
        slug: "software-saas",
        level: 2,
        description: "Software products, cloud SaaS platforms, and enterprise applications.",
        isActive: true,
        sortOrder: 1,
        createdAt: "2026-09-21T00:46:04.489Z",
        updatedAt: "2026-09-21T00:46:04.489Z",
      },
    ],
    meta: {
      total: 109,
      page: 1,
      limit: 2,
      totalPages: 55,
    },
  },
  timestamp: "2026-09-21T06:50:10.304Z",
};

// Parse and validate paginated response
const response: PaginatedCategoryResponse = PaginatedCategoryResponseSchema.parse(rawPaginatedPayload);
console.log(`Loaded page ${response.data.meta.page} with ${response.data.items.length} items`);
