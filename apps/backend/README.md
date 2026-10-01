# Orgatick Backend

The robust, scalable, and modular backend API for **Orgatick**, built with [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/), [PostgreSQL](https://www.postgresql.org/), [TypeORM](https://typeorm.io/), and [Redis](https://redis.io/).

---

## Table of Contents

- [Overview](#-overview)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Features & Modules](#-features--modules)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [Available Scripts](#-available-scripts)
- [Docker Support](#-docker-support)
- [Code Quality & Linting](#-code-quality--linting)
- [License](#-license)

---

## Overview

`orgatick-backend` powers the core identity, authentication, user management, geographic addressing, and file management services of the Orgatick ecosystem. It features:

- Standardized API contracts and input validation using [Zod](https://zod.dev/) via `@orgatick/contracts`.
- Transactional consistency with `typeorm-transactional`.
- Resilient distributed caching and rate-limiting backed by Redis.
- Secure object storage with Cloudflare R2 presigned URLs.
- Transactional email dispatching using [Resend](https://resend.com/).
- Integrated observability and metrics via `@nestjs/observe`.

---

## Tech Stack & Architecture

- **Runtime & Language**: Node.js (v24+ recommended) • TypeScript
- **Framework**: [NestJS v12](https://nestjs.com/) (Express platform)
- **Database & ORM**: PostgreSQL • [TypeORM](https://typeorm.io/) • `typeorm-transactional` • `typeorm-naming-strategies` (snake_case)
- **Caching & Rate Limiting**: Redis (`ioredis`, `@keyv/redis`, `cache-manager`)
- **Validation**: [Zod](https://zod.dev/) (`StandardSchemaValidationPipe`) • `@orgatick/contracts`
- **File Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) via AWS S3 SDK Presigner (`@aws-sdk/client-s3`)
- **Email Service**: [Resend](https://resend.com/)
- **Authentication**: JWT (`@nestjs/jwt`), HTTP-only Cookies (`cookie-parser`), Passkeys & bcrypt
- **Observability**: `@nestjs/observe` runtime metrics
- **Linter & Formatter**: [Biome](https://biomejs.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## Features & Modules

### 1. Authentication (`src/modules/authentication`)
- **Sign In / Sign Up**: Email & password authentication with secure bcrypt password hashing.
- **Session Management**: Multi-device session tracking, refresh token rotation, cookie-based token storage, and session revocation.
- **Password Recovery**: Secure password reset flow and change password operations.

### 2. Identity & Security (`src/modules/identity`)
- **Security & Multi-Factor**: Backup codes, passkeys (WebAuthn), and verification tokens.
- **Login Auditing**: Tracking login attempts, devices, and security logs.

### 3. Users (`src/modules/users`)
- **Profile Management**: Get current user profile (`/me`), update user info, avatar management.
- **User CRUD**: Management endpoints for administrative and platform operations.

### 4. Address & Geography (`src/modules/address`)
- **Hierarchical Geo Data**: Countries, Administrative Divisions (States / Provinces), and Cities.
- **User Addresses**: CRUD operations for managing shipping and billing addresses.
- **Built-in Seeders**: Pre-populated datasets for countries, administrative divisions, and cities.

### 5. Infrastructure (`src/infrastructure`)
- **Storage**: Cloudflare R2 (S3-compatible) support for both public and private buckets with secure presigned URL generation.
- **Rate Limiting**: Sliding-window Redis-based rate limiting guard with route-level configuration.
- **Mail**: Asynchronous email delivery via Resend API.
- **Cache**: Fast key-value caching layer with Redis.

---

## Project Structure

```
orgatick-backend/
├── src/
│   ├── app.controller.ts            # Root & health check endpoints
│   ├── app.module.ts                # Main application module
│   ├── app.service.ts               # Core app service
│   ├── main.ts                      # Application entry point & bootstrap
│   ├── data-source.ts               # TypeORM DataSource CLI configuration
│   ├── common/                      # Shared filters, interceptors, decorators, utils
│   │   ├── decorators/              # Custom decorators (e.g. CurrentUser, Public, RateLimit)
│   │   ├── filters/                 # Global exception filters (HttpException / AllExceptions)
│   │   ├── interceptors/            # Transform response interceptors
│   │   └── types/                   # Shared type definitions
│   ├── config/                      # ConfigModule and configuration schemas
│   ├── database/                    # Database setup, migrations, and seeders
│   │   ├── migrations/              # TypeORM database migrations
│   │   └── seeder/                  # Geographical & reference data seeders
│   ├── infrastructure/              # External service integrations
│   │   ├── mail/                    # Resend email service
│   │   ├── rate-limit/              # Redis rate-limiting guard and service
│   │   ├── redis/                   # Redis connection & caching module
│   │   └── storage/                 # Cloudflare R2 / S3 storage service
│   └── modules/                     # Domain modules
│       ├── address/                 # Countries, states, cities, user addresses
│       ├── authentication/          # Login, signup, sessions, passwords
│       ├── identity/                # Security, devices, passkeys, verification
│       └── users/                   # User profiles and user management
├── biome.json                       # Biome formatter & linter configuration
├── Dockerfile                       # Multi-stage production & development Dockerfile
├── package.json                     # Dependencies and npm scripts
├── pnpm-lock.yaml                   # Pnpm lockfile
└── tsconfig.json                    # TypeScript configuration
```

---

## Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (>= 22.x or 24.x recommended)
- [pnpm](https://pnpm.io/) (>= 9.x)
- [PostgreSQL](https://www.postgresql.org/) (>= 15.x)
- [Redis](https://redis.io/) (>= 7.x)
- GitHub Personal Access Token (PAT) with `read:packages` scope (to access `@orgatick/*` scoped packages from GitHub Packages).

---

## Getting Started

### 1. Authenticate with GitHub Packages & Install Dependencies

Ensure your `GITHUB_TOKEN` is configured or set in your environment:

```bash
pnpm install
```

### 2. Run Database Migrations & Seeds

```bash
# Build the project first to prepare compiled entities and data-source
pnpm run build

# Run migrations
pnpm run migration:run

# (Optional) Seed initial geographical data (countries, states, cities)
pnpm run seed
```

### 3. Start the Server

```bash
# Development (with hot-reload)
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production mode
pnpm run start:prod
```

The API will be available at `http://localhost:5050` (or the configured `PORT`).

---

## Database Migrations & Seeding

All migrations are handled with TypeORM.

```bash
# Generate a new migration based on entity changes
pnpm run migration:generate

# Create a blank migration file
pnpm run migration:create -- src/database/migrations/YourMigrationName

# Apply pending migrations
pnpm run migration:run

# Revert the last applied migration
pnpm run migration:revert

# Seed reference data (geographical & default entities)
pnpm run seed
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run start` | Starts the application with Nest CLI |
| `pnpm run start:dev` | Starts the application in watch mode |
| `pnpm run start:debug` | Starts the application in debug mode |
| `pnpm run build` | Builds the application to `dist/` |
| `pnpm run start:prod` | Runs the compiled production build from `dist/main` |
| `pnpm run check` | Checks formatting and linter issues using Biome |
| `pnpm run format` | Auto-formats codebase using Biome |
| `pnpm run lint` | Lints and auto-fixes issues using Biome |
| `pnpm run migration:generate` | Generates a new migration against compiled data-source |
| `pnpm run migration:run` | Runs all pending database migrations |
| `pnpm run migration:revert` | Reverts the last migration |
| `pnpm run seed` | Seeds geographical data (countries, administrative divisions, cities) |

---

## Docker Support

The project includes a multi-stage `Dockerfile` supporting both development and production targets:

### Build and Run with Docker

```bash
# Build the production image (passing GITHUB_TOKEN secret for package registry)
docker build \
  --secret id=github_token,env=GITHUB_TOKEN \
  --target production \
  -t orgatick-backend:latest .

# Run the container
docker run -p 5050:5050 --env-file .env orgatick-backend:latest
```

---

## Code Quality & Linting

This project uses [Biome](https://biomejs.dev/) for lightning-fast linting and formatting.

```bash
# Check code style and linting
pnpm run check

# Auto-format files
pnpm run format

# Auto-fix linting issues
pnpm run lint
```

---

## License

This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
