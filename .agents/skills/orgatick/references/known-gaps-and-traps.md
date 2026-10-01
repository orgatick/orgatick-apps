# Known gaps and traps

Things that look like bugs, are not, or are unfinished. Verify in the current
codebase before relying on any of this — the repo moves fast.

## The documented skill may be stale

`organization-context/SKILL.md` points at `docs/organization-context.md` at the repo
root. **No `docs/` directory exists in this checkout.** Use the skill's inline
summary, then confirm against `apps/backend/src/modules/organization/context/`.

## `PermissionGuard` does not check anything

`src/common/authorization/guards/permission.guard.ts` reads the `@RequirePermission`
metadata and then returns `true` unconditionally:

```ts
const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSION_KEY, [...]);
if (!requiredPermissions || requiredPermissions.length === 0) {
  return true;
}
return true;   // <-- stub
```

Permission keys (`"resource:action"`) are fully defined and seeded, but the guard
does not enforce them. **Do not protect a new endpoint with `@RequirePermission`
alone.** Use `PlatformAdminGuard` for platform routes, or explicit membership/role
checks (or `OrganizationContextGuard` + role id) until this is implemented. Flag it
if your feature depends on it.

## Two pagination shapes

`packages/contract/src/common/response.ts` documents the
`{ items, meta: { total, page, limit, totalPages } }` shape via
`createPaginatedDataSchema` / `createPaginatedApiResponseSchema`. The shape live
endpoints actually return is the flat `PaginatedResult<T>` from
`packages/contract/src/address/responses/paginated-result.ts`.

Neither is applied automatically: controllers return the raw object and
`TransformInterceptor` wraps it. Only `organization-category/responses/category.response.ts`
uses the `common/` factories, and nothing in the monorepo consumes them.

Read the `api-response-contracts` skill for the intended convention, but match the
neighbouring endpoint when adding a new one rather than mixing shapes in one feature.

## Frontend code defends against multiple response shapes

`extractArray()` in `packages/address/src/libs/apis/address.api.ts` and
`apps/client/lib/apis/address.api.ts` unwraps `data`, `data.items`, `data.results`,
`items`, and `results`. Same defensive token-sniffing appears in
`auth.service.ts` (`response.data.token || response.data.accessToken || response.data.data?.token || ...`).

This is a symptom of contract drift, not a pattern to extend. New code should read
the documented envelope (`response.data.data`) directly.

## bigint ids and JSON

Primary keys are `bigint` columns and entities use `id!: bigint`, but
`TransformInterceptor` passes the object straight to `res.json()`, which throws on
`bigint`. Services therefore map entities to response objects, and the
organization-context code notes ids must be `String(...)`-ified before leaving the
process.

When you add a response mapping that includes an id, verify the type. Returning a
raw entity from a controller is a latent runtime error.

## `docs`-level inconsistencies worth not copying

- `packages/contract/README.md` calls the package private and describes CI
  workflows; the package is actually not `private: true` and there is no
  `.github/` directory.
- `@changesets/cli` is installed with `changeset` scripts but no `.changeset/`
  directory exists, so changesets do not function.
- `packages/email/readme.md` is untouched React Email starter boilerplate and
  describes port 3000; the actual dev port is 4000.
- `context.md` in the repo root is a long architectural document that predates the
  current code. Treat `apps/` and `packages/` as the source of truth.

## Inconsistent folder naming

Backend features use both plural and singular subfolders:

```text
modules/address/       controllers/ services/ repositories/ entities/   (plural)
modules/users/         controller/  service/  repositories/ entities/   (mixed)
modules/identity/      controller/  service/  entities/ dto/
```

Match the local module. Do not normalize as a side effect.

In `packages/contract`, `address/` and `auth/` use `schema/` while `users/` is
four flat files. New domains should follow the nested style.

## Barrel inconsistency

`packages/contract` mixes `export * from "./dtos/index.js"` (with extension) and
`export * from "./schema"` (without). `packages/email` uses extensionless
throughout. Match the file you are editing.

## `packages/address` export globs do not cross directories

`"./components/*": "./src/components/*.tsx"` resolves `address-card` but not
`address/country-select`. Same for `map/*` excluding `map/types.ts` and
`map/use-leaflet.ts`. This is expected; the package intends consumers to use
`AddressForm`, `AddressCard`, and the hooks, not its internals.

## Workspace names are inconsistent

`@orgatick/backend`, `@orgatick/contracts`, `@orgatick/ui`, `@orgatick/address`,
`@orgatick/email-templates` are scoped; `client`, `organizer`, `admin` are not.
`--filter` needs the exact `name`.

## No `middleware.ts`

Route protection happens in layouts (the organizer root layout fetches `/users/me`
and renders `RestrictedAccess`). Do not assume Next middleware exists or that
middleware is the right place — follow the layout pattern.

## No tests

No test files, no backend test config. `pnpm test` passes vacuously. Be explicit in
your report that validation was typecheck/lint only.

## Missing `.changeset`, no CI in checkout

`turbo.json` is authoritative for tasks; there is no `.github/` workflow directory
in this checkout even though the docs mention CI.

## Things that look missing but exist

- **Rate limiting** — implemented globally (`RateLimitGuard`) with per-domain
  policies; look in `src/infrastructure/rate-limit/`.
- **Redis cache** — `cacheModule` is global and injected via `@Inject(CACHE_MANAGER)`.
- **Observability** — `@nestjs/observe` is wired in `app.module.ts`
  (`createObserveModule`, `ObserveInstrument`).
- **File uploads** — handled with `AnyFilesInterceptor` + `memoryStorage()` +
  `FormDataJsonInterceptor`.
- **API versioning** — there is none, by design. Routes are unprefixed.
- **Swagger/OpenAPI** — not present. Don't add it as part of a feature.