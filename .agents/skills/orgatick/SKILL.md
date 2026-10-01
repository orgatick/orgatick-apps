---
name: orgatick
description: >
  Orientation and placement rules for the Orgatick monorepo. Use when starting any
  task that touches apps/backend (NestJS), apps/client, apps/organizer, apps/admin
  (Next.js), or packages/{contract,email,ui,address}. Covers where new code belongs,
  the dependency direction apps → packages, validation commands (pnpm/turbo/Biome),
  and the Zod-contract-first rule. Triggers on: orgatick, monorepo, apps/backend,
  apps/client, apps/organizer, apps/admin, packages/contract, packages/ui,
  @orgatick/contracts, "where should this go", "which app owns this", adding a
  feature, adding an endpoint, adding a shared component, new domain module.
license: MIT
metadata:
  author: Orgatick Team
  version: "1.0.0"
  tags: orgatick, monorepo, architecture, turborepo, nestjs, nextjs, contracts
---

# Orgatick Monorepo

Orgatick is an event-management SaaS. This skill is the **orientation layer**: what
the repo is, which workspace owns what, and how to place new code. Read it before
writing code in any Orgatick workspace.

The source code is authoritative over this skill and over `context.md`. When they
disagree, inspect the code and follow it.

## Repo map

```text
orgatick-mono-repo/
├── apps/
│   ├── backend/     @orgatick/backend  NestJS 12 · TypeORM · PostgreSQL · Redis · port 5050
│   ├── client/      client             Next.js 16 · participant + marketing site · port 3000
│   ├── organizer/   organizer          Next.js 16 · organization operator dashboard · port 3001
│   └── admin/       admin              Next.js 16 · Orgatick platform console · port 3002
├── packages/
│   ├── contract/    @orgatick/contracts       Zod wire contracts (BUILT → dist/)
│   ├── ui/          @orgatick/ui              React component library (source, no build)
│   ├── address/     @orgatick/address         address forms/hooks/map (source, no build)
│   └── email/       @orgatick/email-templates React Email templates (CLI, no exports map)
├── .agents/skills/  agent skills
├── docs/            design-system.md (UI conventions)
├── AGENTS.md, README.md, context.md
├── biome.json, turbo.json, pnpm-workspace.yaml
```

Audience split, which decides placement more than anything else:

| Audience      | Workspace                            |
| ------------- | ------------------------------------ |
| Event attendee| `apps/client`                        |
| Org operator  | `apps/organizer`                     |
| Platform staff| `apps/admin`                         |
| Shared logic  | `apps/backend`                       |
| Shared wire format | `packages/contract`             |
| Shared UI     | `packages/ui`                        |
| Shared email  | `packages/email`                     |
| Shared address| `packages/address`                   |

## Dependency direction

```text
apps/*  ──▶  packages/*
packages/*  ──▶  nothing (no app imports, no cross-app imports)
```

Never the reverse. `packages/ui` must not import from `apps/client`;
`packages/email` must not import from `apps/backend`. Apps never share code
directly — they go through a package, and only when reuse is real (2+ consumers,
stable shape, clear owner).

## Placement decision

Ask: **"Who owns this behavior?"** Then:

| The thing                                     | Goes to                                   |
| --------------------------------------------- | ----------------------------------------- |
| A business rule, query, transaction, workflow| `apps/backend` under its domain module     |
| A database entity, column, index, migration   | `apps/backend`, next to its domain        |
| An API request/response shape shared ≥2 apps  | `packages/contract` as a Zod schema        |
| A reusable React primitive (button, dialog)   | `packages/ui`                              |
| A participant-facing screen or form           | `apps/client`                              |
| An organizer/tenant-facing screen             | `apps/organizer`                           |
| A moderation/verification screen              | `apps/admin`                               |
| An email body/layout                          | `packages/email`                           |
| Reusable address/city search                  | `packages/address`                         |

Split the same concept by layer when it spans audiences. Registration example:

```text
apps/backend    registration business rule + entity + endpoints
apps/client     participant registration UI
apps/organizer  registration management UI
apps/admin      registration moderation UI
packages/contract  RegistrationRequest/RegistrationResponse schemas  (shared)
packages/ui        Button / DataTable / Dialog                     (shared)
```

## The contracts-first rule

`packages/contract` is the only place request and response shapes are defined.
Both sides import the same Zod schema, so drift is a compile error rather than a
production bug.

- Backend binds it in the controller with `@Body({ schema: XSchema })`.
- Frontend uses the inferred type for the form/hook and the schema for
  client-side validation.

Never hand-write a `type Foo = { ... }` in an app for something that crosses the
network. Never define a DTO class with `class-validator` — this repo uses Zod end
to end.

Two important build facts (see `references/packages.md`):

- `@orgatick/contracts` is consumed as **built `dist/`**, so `pnpm turbo build
  --filter=@orgatick/contracts` is required before typechecking an app that
  consumes your change.
- `@orgatick/ui` and `@orgatick/address` are consumed as **raw TypeScript
  source** via `exports` maps — no build needed, edits are live.

## How to work here

1. **Read before writing.** Find the closest existing analogue and mirror it.
   Every convention in this repo was extracted from real files; grep for the
   pattern instead of inventing one.
2. **Pick the workspace** using the table above.
3. **Make the smallest coherent change.** No opportunistic refactors, no
   reformatting unrelated files.
4. **Keep business logic in the backend.** Frontend validation is UX only.
   Ticket capacity, payment status, org membership, and check-in validity are
   all backend decisions.
5. **Validate narrowly, then widen.** See `references/tooling-and-validation.md`.

```sh
pnpm turbo check-types --filter=@orgatick/backend   # narrow first
pnpm check-types                                     # then the whole repo
pnpm lint
```

## Reference files

Load these on demand; do not read all of them up front.

| File                                                    | Read when                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| `references/backend-nestjs.md`                          | Any change in `apps/backend`                                     |
| `references/nextjs-apps.md`                             | Any change in `client` / `organizer` / `admin`                    |
| `references/packages.md`                                | Any change in `packages/*`, or adding a shared contract/component|
| `references/tooling-and-validation.md`                  | Running builds, typechecks, migrations, adding a dependency      |
| `references/known-gaps-and-traps.md`                    | Before assuming something exists, or when types/builds mislead   |
| `examples/end-to-end-feature.md`                        | Adding a full vertical slice, as a file-by-file template         |

## Related skills in this repo

Load these alongside this one when relevant — they cover a single subsystem in
depth:

- `organization-context` — current-org cookie, `OrganizationContextGuard`,
  `@CurrentOrganization()`, membership Redis cache.
- `orgatick-design-system` — UI conventions for `packages/ui` and the three
  Next.js apps: tokens, typography, the badge/status rule, motion budget, and the
  component inventory. Full reference in `docs/design-system.md`.
- `api-response-contracts` — response envelope and pagination schema factories.
- `zod` — Zod v4 patterns for writing schemas.
- `react-email` / `email-best-practices` / `orgatick-email-templates` — email.

## Hard rules

- `apps/backend` is the backend. Not an "API package".
- No new package manager, no ESLint (Biome only), no Redis as source of truth.
- No `common/entities` dumping ground; entities live with their domain.
- No framework code (NestJS, Next.js) inside `packages/` unless the package
  already is that framework's package.
- Never trust client-supplied org ids, roles, payment status, or check-in results.
- Do not modify `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or root `package.json`
  casually.