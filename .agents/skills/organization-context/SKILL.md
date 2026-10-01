---
name: organization-context
description: Use when working on the Current Organization Context system in orgatick-backend — the current_organization_id cookie, /session/organizations and /session/organization endpoints, OrganizationContextGuard, @CurrentOrganization(), organization:membership:{userId}:{orgId} Redis cache, membershipCacheKey(), or Membership cache invalidation. Covers architecture, API contracts, Redis keys/TTL, DB queries, env vars, and how to scope a controller to an organization.
---

# Current Organization Context

Reference implementation knowledge for orgatick-backend's multi-organization
scoping. The canonical document is `docs/organization-context.md` at the repo
root — read it for the full picture, diffs, and rationale. This skill is the
fast-loading summary.

## What it is

- An HttpOnly cookie `current_organization_id` stores the user's selected org.
- `OrganizationContextGuard` (opt-in, NOT global) validates the cookie against
  an `ACTIVE` `OrganizationMember`, then attaches
  `request.organizationContext = { organizationId, membershipId, roleId }` (bigints).
- `@CurrentOrganization()` param decorator returns that context in a handler.
- Session endpoints let the client list organizations and switch the selection.

## API contract (Authorization: Bearer required)

- `GET /session/organizations` →
  `{ organizations: [{ id: string, name: string }], currentOrganizationId: string | null }`.
  `null`/cleared when the cookie is absent, malformed, or not an active membership.
- `POST /session/organization` body `{ organizationId: "205" }` (zod, `/^\d+$/`).
  Validates active membership (`403` if not), warms cache, sets cookie, returns
  `{ id: string, name: string }`.
- Handler errors: no `request.user` → `401`; missing/malformed cookie → `400`
  "Current organization not selected"; no active membership → cookie cleared +
  `403` "You are not an active member of this organization".

## Cookie spec

`current_organization_id`, `httpOnly: true`, `secure: NODE_ENV === "production"`,
`sameSite: "lax"`, `path: "/"`, `maxAge` 30 days, optional `domain` from
`COOKIE_DOMAIN`. Reading is strict: only `/^\d+$/` strings are accepted.

## Redis cache

- Key: `organization:membership:{userId}:{organizationId}` via `membershipCacheKey()`.
- Value: `{ membershipId, organizationId, roleId }` — ALWAYS strings (bigint is not JSON-serializable).
- TTL: env `ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS`, default 300000 (5 min).
- Store: global `@Inject(CACHE_MANAGER)` (KeyvRedis, `src/infrastructure/redis/cache.module.ts`).
- Redis errors are swallowed → treated as cache miss/failed write. Redis is an
  optimization layer, never the source of truth; PostgreSQL is the fallback and
  the cookie is never trusted alone.

## DB queries (OrganizationMemberRepository)

- `findActiveMembership(orgId, userId)` — one ACTIVE membership (relations: organization, role).
- `findActiveMembershipsByUser(userId)` — all ACTIVE memberships, createdAt DESC.

## Cache invalidation

Any membership mutation (create/disable/remove/restore/re-role) must call
`OrganizationMemberService.invalidateMembershipCache(userId, organizationId)`,
which does `cacheManager.del(membershipCacheKey(userId, organizationId))`.
Currently wired after `addOwner` only.

## Usage in a controller

```ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentOrganization, OrganizationContext, OrganizationContextGuard } from "../context";

@Controller("organizations")
@UseGuards(OrganizationContextGuard)
export class OrgScopedController {
  @Get()
  handle(@CurrentOrganization() org: OrganizationContext) {
    return `org=${org.organizationId} role=${org.roleId}`;
  }
}
```

Remember ids are bigint at this layer: stringify (`String(...)`) before they
leave the process. Never compare self-issued cookies without DB/Role validation.

## Key files

- Components: `src/modules/organization/context/{constants,types,services,guards,decorators}`
- Endpoints: `src/modules/organization/organization-session/{controllers,services,dto,types}`
- Repository: `src/modules/organization/organization-member/repositories/member.repository.ts`
- Invalidation: `src/modules/organization/organization-member/services/member.service.ts`
- Env: `src/config/env.validation.ts` (`ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS`)
- Cache store: `src/infrastructure/redis/cache.module.ts`
- Full doc: `docs/organization-context.md`