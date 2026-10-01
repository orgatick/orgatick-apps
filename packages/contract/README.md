# `@orgatick/contracts`

Shared API wire contracts, DTO schemas, and TypeScript types for Orgatick applications.

> **Note:** This package is **private** and published exclusively to GitHub Packages (`https://npm.pkg.github.com`) for internal Orgatick services.

## Overview

- **Source of Truth:** Zod schemas are the single source of truth. All TypeScript types are inferred directly via `z.infer`.
- **API Contract Separation:** Request and response contracts are strictly decoupled (`CreateUserRequest`, `UpdateUserRequest`, `UserResponse`).
- **IDs:** Uses BIGINT-compatible positive integer numeric representation for database identity IDs.
- **Timestamps:** Serialized as ISO 8601 UTC datetime strings.

## Planned Modules Architecture (Incremental Implementation)

- **Phase 0:** `common` (Shared primitives, pagination, response wrappers)
- **Phase 1:** `users` / `identity` (User profile, auth roles, credentials)
- **Phase 2:** `organizations` (Organization profiles, memberships)
- **Future Phases:** `compliance`, `events`, `ticketing`, `inventory`, `registrations`, `participants`, `orders`, `payments`, `attendance`, `notifications`, `admin`, `risk`, `analytics`, `platform`

## Current Modules

### User Module (`src/users/`)

- `enums.ts`: `GenderSchema` (`male` | `female` | `notToSay`), `UserRoleSchema` (`user` | `admin`)
- `schemas.ts`: `UserIdSchema` (positive numeric integer)
- `requests.ts`: `CreateUserRequestSchema`, `UpdateUserRequestSchema`
- `responses.ts`: `UserResponseSchema`
- `index.ts`: Re-exports all schemas and inferred TypeScript types.

## Installation & Setup

Install package dependencies:

```bash
pnpm install
```

## Available Scripts

- **Type Check:**
  ```bash
  pnpm typecheck
  ```
- **Lint & Format Check (Biome):**
  ```bash
  pnpm biome check .
  ```
- **Run Unit Tests:**
  ```bash
  pnpm test
  ```
- **Build Package:**
  ```bash
  pnpm build
  ```
- **Create Changeset:**
  ```bash
  pnpm changeset
  ```

## Release & Publishing Workflow (Changesets + GitHub Actions)

```
Change contract → Create changeset (pnpm changeset) → Commit & Push to main → GitHub Action (changesets/action) → Version PR created / Published to GitHub Packages (@orgatick/contracts)
```

### GitHub Repository One-Time Setup Requirement

For `changesets/action` to automatically open Version Release PRs on GitHub:

1. Navigate to **GitHub Repository Settings** → **Actions** → **General**.
2. Scroll to **Workflow permissions**.
3. Enable **"Allow GitHub Actions to create and approve pull requests"**.

### Workflows

- **`.github/workflows/ci.yml`**: Runs linting (`biome check`), type checking (`tsc --noEmit`), unit tests (`vitest`), and build on pull requests targeting `main`.
- **`.github/workflows/publish.yml`**: Runs `changesets/action@v1` on `main` branch pushes to automatically manage release PRs and publish updated package versions to GitHub Packages (`https://npm.pkg.github.com`).

## Package Usage

```typescript
import {
  UserResponseSchema,
  CreateUserRequestSchema,
  UserRoleSchema,
  GenderSchema,
  type UserResponse,
  type CreateUserRequest,
} from "@orgatick/contracts";
```
