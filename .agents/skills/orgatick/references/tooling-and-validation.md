# Tooling and validation

pnpm 11.23.0 · Node ≥ 24 · Turborepo 2.11 · Biome 2.5.8. No ESLint, no Prettier.

## Root commands

```sh
pnpm dev          # turbo run dev      (all workspaces, watch)
pnpm build        # turbo run build
pnpm check-types  # turbo run check-types   (alias: pnpm typecheck)
pnpm lint         # turbo run lint
pnpm test         # turbo run test
pnpm format       # biome format --write .
pnpm check        # biome check --write .
pnpm tunnel       # cloudflared tunnel run orgatick-dev
```

Target one workspace with a filter:

```sh
pnpm turbo check-types --filter=@orgatick/backend
pnpm turbo build --filter=@orgatick/contracts
pnpm turbo dev --filter=organizer
```

Workspace names are inconsistent by design of history: `@orgatick/backend`,
`@orgatick/contracts`, `@orgatick/ui`, `@orgatick/address`,
`@orgatick/email-templates`, but `client`, `organizer`, `admin` (unscoped). Use
the `name` field of the relevant `package.json` rather than guessing.

## turbo.json task graph

```jsonc
{
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build":       { "dependsOn": ["^build"], "inputs": ["$TURBO_DEFAULT$", ".env*"],
                     "outputs": [".next/**", "dist/**", ".react-email/**"] },
    "lint":         { "dependsOn": ["^lint"] },
    "check-types":  { "dependsOn": ["^check-types"] },
    "test":         { "dependsOn": ["^build"] },
    "dev":          { "cache": false, "persistent": true },
    "clean":        { "cache": false }
  }
}
```

- `check-types` and `lint` depend only on the same task in *dependencies*
  (`^`), so `packages/ui`'s `check-types` runs before an app's. They do **not**
  build anything.
- `test` depends on `^build`, so `pnpm test` rebuilds dependencies first.
  `check-types` does not. This asymmetry is the source of stale-declaration bugs.

`AGENTS.md` contains a turbo-managed block instructing agents to read the installed
turbo package docs before changing `turbo.json`. Follow it.

## Validation order

Run the narrowest useful check first, then widen:

```sh
# 1. the workspace you touched
pnpm turbo check-types --filter=@orgatick/backend
pnpm turbo lint --filter=@orgatick/backend

# 2. if you touched packages/contract, rebuild it before any app check
pnpm turbo build --filter=@orgatick/contracts

# 3. widen
pnpm check-types
pnpm lint
pnpm build      # only when the change crosses build boundaries
```

Do not run `pnpm build` or `pnpm test` for a docs-only or single-file frontend
change; it is slow and adds no signal.

## The stale-dist trap

`@orgatick/contracts` is consumed as built `dist/index.d.ts`. If you edit a schema
and then typecheck or run an app, the app still sees the **old** declarations and
errors like `Property 'x' does not exist on type 'Y'` for something you just added,
or conversely no error for something you removed.

```sh
pnpm turbo build --filter=@orgatick/contracts   # required after every contracts change
```

`@orgatick/ui` and `@orgatick/address` are consumed as source, so they need no
build. Adding a new package export map entry requires a `pnpm install` from the
root so the symlink metadata updates.

## Biome

Root `biome.json` governs the whole repo: 2-space indent, line width 120,
recommended lint preset, `organizeImports` assist **off**, and
`javascript.parser.unsafeParameterDecoratorsEnabled: true` (required for NestJS
parameter decorators). Ignored paths include `.next`, `dist`, `.turbo`,
`.react-email`, `node_modules`, `database/seeder/data`, and
`orgatick.chartdb.json`.

A few a11y rules are off (`noSvgWithoutTitle`, `useSemanticElements`,
`useFocusableInteractive`) and `useImportType` is off.

Per-package `biome.json` files just extend the root (`{"extends": "//"}`), plus
`apps/backend` has its own for the Nest build. Format and lint use the same
config, so `pnpm check` (write) is the local fix loop:

```sh
pnpm exec biome check --write <paths>   # fix the files you changed
```

Never run a repo-wide format write as part of a feature — it produces a huge
unrelated diff.

## Backend scripts

From `apps/backend`:

```sh
pnpm --filter @orgatick/backend start:dev     # nest start --watch --no-shell
pnpm --filter @orgatick/backend build         # nest build
pnpm --filter @orgatick/backend migration:create <name>
pnpm --filter @orgatick/backend migration:generate
pnpm --filter @orgatick/backend migration:run
pnpm --filter @orgatick/backend migration:revert
pnpm --filter @orgatick/backend seed
pnpm --filter @orgatick/backend chartdb       # docker compose for ChartDB
```

Note the migration and seed scripts run through
`ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js ... -d dist/data-source.js`,
so they read the **built** `dist/data-source.js`. Run `pnpm build` in the backend
first, or the migrations/seeders will run against stale entity code.

## Local services

Backend needs PostgreSQL and Redis; both default to `localhost`. Frontends need
`NEXT_PUBLIC_API_URL`. Copy `apps/backend/.env.example` to `apps/backend/.env` and
the matching file for each app. Env values are validated by Zod at boot
(`src/config/env.validation.ts`), so a missing required variable fails fast with a
schema error rather than a runtime `undefined`.

The tunnel script (`pnpm tunnel`) expects a `orgatick-dev` Cloudflare tunnel config.
`next.config.js` allows the dev origins `192.168.1.60`, `10.224.52.173`, and
`dev.orgatick.site`.

## Tests

There is effectively no test suite right now: no `*.spec.ts`/`*.test.ts` files in
the backend, no test files in `packages/contract`, and the only test script is
`vitest run --passWithNoTests` with no vitest config. `pnpm test` will pass without
running anything. Do not claim tests passed as evidence that a change is correct —
say explicitly that the repo has no tests for this area.

If you add tests, you must add the runner configuration too (jest config for the
NestJS backend, `vitest.config.ts` for packages) and note the new dependency.

## Adding a dependency

```sh
pnpm --filter @orgatick/backend add <pkg>     # or: cd apps/backend && pnpm add <pkg>
pnpm install                                    # refresh the lockfile after package.json edits
```

Rules: install in the workspace that owns the usage; never hoist to the root
`package.json`; don't touch `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or
`turbo.json` without reading them first. `pnpm-workspace.yaml` also declares
`onlyBuiltDependencies`, `allowBuilds`, and `peerDependencyRules` (pinning
`typeorm` and `ioredis`) — a new native or postinstall-heavy dependency may need an
entry there.

## Code size

Keep files under roughly 200 lines where practical. When a file grows, split by
responsibility, not to hit a number. Avoid giant `common/` folders and
giant utility modules.