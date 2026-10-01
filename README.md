# Orgatick

Event platform monorepo managed with [Turborepo](https://turborepo.dev) and [pnpm](https://pnpm.io).

## Apps

| Package               | Port | Stack                        | Description                                  |
| --------------------- | ---- | ---------------------------- | -------------------------------------------- |
| `apps/backend`        | 5050 | NestJS, TypeORM, PostgreSQL  | REST API, auth, organizations, email, cache  |
| `apps/organizer`      | 3001 | Next.js (App Router)         | Organizer-facing dashboard                   |
| `apps/client`         | 3000 | Next.js (App Router)         | Public event site                            |
| `apps/admin`          | 3002 | Next.js (App Router)         | Platform administration console               |

## Packages

| Package                    | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `@orgatick/contracts`      | Shared Zod schemas and DTO types used by every app and service      |
| `@orgatick/ui`             | Shared React component library                                     |
| `@orgatick/address`        | Address and administrative-division data                           |
| `@orgatick/email-templates`| Transactional email templates                                       |

## Requirements

- Node.js >= 24
- pnpm 11.23.0

## Getting started

```sh
pnpm install
cp apps/backend/.env.example apps/backend/.env
```

See each app's `.env.example` for required configuration. The backend needs
PostgreSQL and Redis; both are expected on `localhost` by default.

## Common tasks

```sh
pnpm dev          # run all apps in watch mode
pnpm build        # build all apps and packages
pnpm check-types  # typecheck every package
pnpm lint         # lint and format check
pnpm test         # run tests
```

Target a single app or package with Turborepo filters:

```sh
pnpm turbo dev --filter=@orgatick/backend
pnpm turbo check-types --filter=@orgatick/contracts
```

> [!IMPORTANT]
> `check-types` resolves workspace packages through their built `dist/` output.
> Run `pnpm build` (or `pnpm turbo build --filter=@orgatick/contracts`) after
> changing anything in `packages/`, otherwise typecheck will use stale or
> missing declarations.

## Conventions

- Formatting and linting are handled by [Biome](https://biomejs.dev/) — there is
  no separate ESLint or Prettier setup.
- API request/response contracts belong in `@orgatick/contracts` so that the
  backend and frontend cannot drift apart.
- [AGENTS.md](./AGENTS.md) holds the guidance used by coding agents in this repo.
