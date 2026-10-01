# packages/ — contract, ui, address, email

Four packages, three different consumption models. Getting the model right is what
prevents "my change has no effect" bugs.

| Package                        | Name                         | Consumption           | Build                |
| ------------------------------ | ---------------------------- | --------------------- | -------------------- |
| `packages/contract`            | `@orgatick/contracts`        | **built `dist/`**     | `tsup` → ESM + d.ts  |
| `packages/ui`                  | `@orgatick/ui`               | raw TS source         | none                 |
| `packages/address`             | `@orgatick/address`          | raw TS source         | none                 |
| `packages/email`               | `@orgatick/email-templates`  | React Email CLI       | `email build`        |

## packages/contract — `@orgatick/contracts`

Single source of truth for every request/response shape. Zod v4 only; types are
inferred, never hand-written.

### Layout

```text
src/
├── index.ts                 re-exports every domain barrel
├── common/response.ts       envelope + pagination factories
├── address/                 dtos/ queries/ responses/ options/ utils/
├── auth/                    schema/ enums/ types/
├── organization/            enums/ schema/ organization-category/
└── users/                   enums.ts requests.ts responses.ts schemas.ts
```

Two coexisting styles: **nested** (`address/`, `auth/`, `organization/` with
`schema/` or `dtos/` subfolders) and **flat** (`users/` with four files at the
domain root). Prefer the nested style for new domains; mirror a sibling domain if
one already covers the same concept.

File naming: kebab-case with a role suffix — `create-address.dto.ts`,
`query-city.dto.ts`, `country-detail.response.ts`,
`administrative-division-find-options.ts`. Every subfolder has an `index.ts`
barrel that re-exports upward, and `src/index.ts` re-exports the domains.

### Naming pattern per schema

Each schema exports 2–4 aliases so consumers can pick a readable name:

```ts
export const CreateAddressSchema = z.object({ /* ... */ });
export const CreateAddressDtoSchema = CreateAddressSchema;   // alias
export type CreateAddressDto    = z.infer<typeof CreateAddressSchema>;
export type CreateAddressRequest = CreateAddressDto;          // alias
export type CreateAddressInput  = z.input<typeof CreateAddressSchema>;
```

Roles: `Schema` (the value), `DtoSchema` (alias), `Dto`/`Query` (`z.infer`),
`Input` (`z.input`, pre-coercion), `Output` (`z.output`, post-transform).

### Query schemas coerce; responses do not

Query params arrive as strings from the URL, so query schemas use `z.coerce`:

```ts
export const QueryCitySchema = z.object({
  countryId: z.coerce.bigint("Invalid country ID").optional(),
  search: z.string().optional(),
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").optional(),
  limit: z.coerce.number().int("Limit must be an integer").min(1).max(100).optional(),
});
```

Booleans need explicit handling — either `z.preprocess` (organization category
query) or a union transform (country query):

```ts
isActive: z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]).optional()
```

Defaults belong in the query schema (`page: 1`, `limit: 20`, `sortBy`, `sortOrder`).

### Two pagination shapes — know which to use

`src/common/response.ts` provides the documented envelope factories:

```ts
createApiResponseSchema(dataSchema)            // { success, statusCode, data, timestamp }
createPaginatedDataSchema(itemSchema)          // { items, meta: PaginationMeta }
createPaginatedApiResponseSchema(itemSchema)   // envelope + { items, meta }
```

`PaginationMeta` is `{ total, page, limit, totalPages }` **nested under `meta`**.

The shape actually returned by live endpoints is the flat
`PaginatedResult<T>` in `src/address/responses/paginated-result.ts`, where
`total`/`page`/`limit`/`totalPages` sit at the **top level**:

```ts
export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
```

Note `createPaginatedDataSchema` (from `common/`) and
`createPaginatedResultSchema` (from `address/`) are **different factories**;
only `PaginatedResult` matches current backend behaviour. Prefer it for new
endpoints and read the `api-response-contracts` skill before changing the
envelope convention globally. See `known-gaps-and-traps.md`.

### Entity response modelling

Responses nest small `…RefSchema` objects for relations rather than duplicating
flat foreign keys:

```ts
export const AddressCountryRefSchema = z.object({
  id: z.bigint("Invalid country ID"), code: z.string(), code3: z.string(), name: z.string(),
});
export const AddressResponseSchema = z.object({
  uuid: z.string("Invalid address UUID"),
  country: AddressCountryRefSchema,
  division: AddressDivisionRefSchema.nullable().optional(),
  city: AddressCityRefSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
```

### Shared runtime helpers

`src/address/utils/` holds two utilities both backend and frontend reuse:

- `formatAddressString(dto, countryName, divisionName?, cityName?)` — joins
  non-empty address parts with `", "`.
- `to-address-response.ts` — `toAddressResponse(entityLike, ...)`, built against a
  structural `AddressEntityLike` interface (works with any ORM entity) and
  `Number()`-coerces `latitude`/`longitude` from `number | string | null`.

Also in contracts: `organization/enums/*.enum.ts` are plain TS `enum`s
(`OrganizationStatus.ACTIVE = "active"`, `OrganizationVerificationStatus`,
`OrganizationSocialPlatform`, `OrganizationMemberRole`, `OrganizationMemberStatus`,
`OrganizationDocumentTypes`, `OrganizationInvitationStatus`,
`OrganizationPaymentAccountStatus`), consumed by Zod via
`z.enum(Object.values(X), { message: "Invalid ..." })`. Frontends import the enum
members directly for comparisons.

### Enums vs Zod for ids

`users/schemas.ts` exports `UserIdSchema` as a numeric id, while address DTOs use
`z.coerce.bigint()`. Backend PKs are `bigint`; browser/JSON handling pushes
toward strings. When adding an id field, follow the neighbouring domain and make
sure ids are stringified before crossing the wire.

### Build and consumption

`tsup.config.ts`: single entry `src/index.ts`, `format: ["esm"]`, `target: es2022`,
`dts: true`, `sourcemap: true`, `clean: true`. `package.json` exposes only the
root export:

```json
"main": "./dist/index.js", "types": "./dist/index.d.ts",
"exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "default": "./dist/index.js" } },
"files": ["dist"]
```

Consequences:

- **No deep imports.** `@orgatick/contracts/address` does not resolve; import
  from the root.
- **Apps read `dist/`.** After editing a schema you must
  `pnpm turbo build --filter=@orgatick/contracts` (or `pnpm build`) before app
  typechecks or dev servers see the change. `turbo.json`'s `test` task depends on
  `^build`, and `build` depends on `^build`, so this happens automatically for
  `pnpm build` and `pnpm test` but **not** for `pnpm check-types` or `pnpm dev`.
- `zod` is both a dependency and a peer dependency here.

### Tests and changesets

`test` is `vitest run --passWithNoTests` with **no vitest config** and currently
zero test files. `@changesets/cli` is installed and `changeset` /
`version-packages` / `release` scripts exist, but there is no `.changeset/`
directory — changesets are not wired up in this checkout. Don't assume either
works without checking.

## packages/ui — `@orgatick/ui`

Shared React components. Presentation only: no business logic, no backend calls.

```json
"exports": {
  "./globals.css": "./src/styles/globals.css",
  "./components/*": "./src/components/*.tsx",
  "./lib/*": "./src/lib/*.ts",
  "./utils": "./src/lib/utils.ts",
  "./assets/*": "./src/assets/*.tsx",
  "./*": "./src/*.tsx"
}
```

Source files are `src/components/*.tsx` (kebab-case), `src/lib/utils.ts`,
`src/styles/globals.css`, `src/assets/`. No barrel — one file per component,
imported by subpath. No `build` script: apps compile it directly.

Component recipe (shadcn-style, on `@base-ui/react` + `cva`):

```tsx
"use client";                                  // only when interactive
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@orgatick/ui/lib/utils";

const buttonVariants = cva("base classes...", {
  variants: { variant: { default: "...", outline: "..." }, size: { default: "...", icon: "..." } },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, ...props }: React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
```

Conventions: `data-slot` attributes on roots, `data-invalid` for invalid state,
variant maps as `Record<Variant, string>` or `cva`, `cn()` for merging, semantic
token classes only (no hex), interactive components start with `"use client"`.

`globals.css` is the theme source of truth for the frontend apps: `@import
"tailwindcss"`, `@custom-variant dark`, `@theme inline` mapping
`--color-*`/`--radius-*`/`--font-*` to CSS variables, then `:root` and `.dark`
blocks. **Change tokens there, not in each app.**

`packages/ui/biome.json` extends the root (`{"extends": "//"}`).

## packages/address — `@orgatick/address`

Reusable address capture UI plus hooks, derived from the GeoNames-derived address
model (`Country` → `Admin1/Admin2` → `City`). Presentation + a data-loading
abstraction; it does not own an HTTP client of its own for consumers.

```json
"exports": {
  ".": "./src/index.ts",
  "./components/*": "./src/components/*.tsx",
  "./components/map": "./src/components/map/index.ts",
  "./components/map/*": "./src/components/map/*.tsx",
  "./hooks/*": "./src/hooks/*.ts",
  "./types": "./src/types.ts"
}
```

Structure:

```text
src/
├── index.ts                       types + AddressForm only
├── types.ts                       AddressFormValues, AddressDataLoader, options types
├── components/
│   ├── address-form.tsx           main composed form ("use client")
│   ├── address-card|address-dialog|address-picker|address-select.tsx
│   ├── address/                   country-select, state-province, level2-administrative, city-select
│   ├── fields/                    address-line-fields, coordinates-fields, general-fields
│   └── map/                       leaflet map, draw, layers, place search, context, types, hooks
├── hooks/                         use-address-hierarchy, use-debounce, use-debounced-value
└── libs/                          build-formatted-address, apis/{address,auth}.api
```

Key patterns:

- **Data loading is injected.** `AddressForm` takes an `AddressDataLoader`
  (`loadCountries`, `loadDivisions`, `loadCities`), so the app decides the HTTP
  client. `use-address-hierarchy.ts` is the reference implementation (loading and
  error state per level, `isMounted` guards).
- **Form values derive from the contract:** `AddressFormValues =
  Partial<CreateAddressDto> & { uuid?: string; [key: string]: unknown }`. Nested
  fields use the `name` prop to build paths like `${name}.${field}`.
- `build-formatted-address.ts` mirrors the backend's `formatAddressString`; both
  derive from the same address fields.
- `AddressForm` auto-syncs `formattedAddress` into the form via
  `form.setValue(..., { shouldDirty: false, shouldTouch: false, shouldValidate: false })`.
- Maps use Leaflet with `react-leaflet`, marker clustering, draw, fullscreen, and
  a `map/index.ts` barrel. Dynamic Leaflet import lives in `map/leaflet-lazy.tsx`.
- Leaflet CSS must be imported by the consumer app.

`libs/apis/address.api.ts` inside the package is an **internal default loader**;
prefer passing your own `AddressDataLoader` from the app so auth and base URL stay
in app code. Note the `exports` glob `./components/*` does not cross directories,
so nested components like `components/address/country-select.tsx` are not
externally importable — that is by design, not a bug to fix.

## packages/email — `@orgatick/email-templates`

React Email 6.9.5 templates. `private: true`, **no `exports` map and nothing in
the monorepo imports it** — the CLI reads `emails/` off disk, and the backend
sends Resend templates by id. See the `orgatick-email-templates`, `react-email`,
and `email-best-practices` skills for the full conventions.

```text
emails/
├── theme.ts                      themeColors + orgatickTailwindConfig (pixelBasedPreset)
├── components/                   EmailLayout, EmailHeader, EmailFooter, EmailButton,
│                                 EmailCard, EmailAlert, EmailDivider, EmailInfoRow (+ index.ts)
├── auth/                         welcome, email-verification, password-reset,
│                                 password-changed, account-deleted, new-device-login
└── organization/                 organization-created, organization-verification-*
```

Template contract (uniform across all 10 templates):

1. `export interface <Name>EmailProps` — every prop optional.
2. `export const <Name>Email = ({ ... }: <Name>EmailProps) => ...` with
   destructured defaults; required runtime values default to `{{{placeholder}}}`
   mustache strings for provider-side substitution.
3. `export default <Name>Email;` for CLI discovery.
4. `<Name>Email.PreviewProps = { ... } satisfies <Name>EmailProps;`

Every template nests inside `<EmailLayout previewText={...}>`, which supplies
`Html`/`Head`/`Body`/`Preview`, the Tailwind config, and a single centered 580px
card. Always start `EmailHeader` and end `EmailFooter`.

Component primitives follow the same recipe: optional props, destructured
defaults, a `Record<Variant, string>` map, inline table-based markup where
Outlook compatibility requires it, and a `box-border` button helper.

`theme.ts` tokens are a **hand-copied duplicate** of `packages/ui`'s CSS variables
(`primary: #204b90`, `background: #f4f7fc`). Keep them in sync manually — there is
no shared token source.

Props are local to each template; this package does not depend on
`@orgatick/contracts`, so prop types are duplicated from contracts rather than
imported. If you add an email that mirrors a contract type, import the enum or
type from `@orgatick/contracts` deliberately (that would add the dependency) or
accept the duplication consciously and say so.

Scripts: `dev` (`email dev --port 4000`), `build` (`email build` → `.react-email/`),
`export` (`email export --out-dir out --pretty`), `check-types` (`tsc --noEmit`,
`.react-email` excluded). `readme.md` is unmodified starter boilerplate — ignore it.

## Rules for all packages

- Packages must not import from `apps/`.
- Packages must not import each other's internals; use declared export subpaths.
- No framework code (NestJS decorators, Next.js server APIs) in a package unless
  the package is that framework's package.
- Adding a dependency to a package means editing that package's `package.json` and
  running `pnpm install` from the repo root. Do not add to root `package.json`.
- Do not promote a pattern to `packages/` for hypothetical reuse. Two real
  consumers and a stable shape is the bar.