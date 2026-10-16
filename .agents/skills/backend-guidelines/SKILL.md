---
name: backend-guidelines
description: >
  Engineering standard and coding guidelines for the Orgatick backend (NestJS,
  TypeScript, PostgreSQL, TypeORM, Zod, REST, Webhooks). Covers architecture and
  dependency direction (Controller → Service → Repository), module/folder
  structure, naming conventions, file size and splitting (200-500+ lines),
  SOLID/DRY/KISS/YAGNI, TypeScript rules, @orgatick/contracts boundary,
  controllers, services, repositories, DTO validation, API response and error
  standards ({ success, data } / { success, error }), database conventions
  (BIGINT identity, snake_case), TypeORM conventions (prefer repository methods
  over QueryBuilder), transactions, concurrency and locking (inventory row locks,
  idempotency), pagination, rate limiting tiers, authentication, authorization
  and tenant isolation, security, logging, external services and webhooks,
  caching, testing strategy, migrations, and anti-patterns. Triggers on: backend,
  nestjs, controller, service, repository, entity, typeorm, postgres, postgresql,
  database, migration, transaction, locking, inventory, reservation, rate limit,
  tenant isolation, @orgatick/backend, backend guidelines, backend coding
  guidelines, guidline, coding standards.
license: MIT
metadata:
  author: Orgatick Team
  version: "1.0.0"
  tags: orgatick, backend, nestjs, typeorm, postgresql, zod, architecture, guidelines, coding-guidelines
---

# Orgatick Backend Coding Guidelines

*NestJS • TypeScript • PostgreSQL • TypeORM • Zod • REST • Webhooks*  
**Engineering Standard | Backend only | Version 1.0**

This skill defines the engineering standard for `apps/backend`. It governs how backend code is structured, named, validated, tested, secured, reviewed, and evolved.

The canonical human-readable document is [`docs/backend-coding-guidelines.md`](../../../docs/backend-coding-guidelines.md).

---

## Non-Negotiable Core Rules

1. **Strict Layering**: HTTP Request → Controller → Transport Validation → Authentication/Authorization → Service → Repository → TypeORM → PostgreSQL.
   - **Controllers never call repositories directly.**
   - Controllers handle HTTP concerns only (params, query, body, user context).
   - Services own business logic and workflows.
   - Repositories own queries and persistence.
2. **TypeORM QueryBuilder is Last Resort**: Avoid `QueryBuilder` when standard repository methods (`find`, `findOne`, `save`, `count`, etc.) suffice. Use repository methods for simple and standard queries.
3. **No Database Entities in `@orgatick/contracts`**: Entities are persistence models, not API contracts. API schemas live in `packages/contract` using Zod.
4. **Tenant Isolation & Server-Side Authorization**: Never trust client-supplied `userId`, `organizationId`, `eventId`, or `ticketId` as proof of ownership. Verify membership and permissions on every organization-scoped call.
5. **Concurrency & Inventory Locking**: Never use read-then-write for capacity/reservations. Use row-level locking (`SELECT ... FOR UPDATE`) or atomic conditional updates. Cache is never the source of truth for inventory or payments.
6. **Consistent Response Envelopes**: Success `{ "success": true, "data": ... }` and Error `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`.
7. **Database Migrations are Immutable**: Never use TypeORM `synchronize: true` in production. Migrations must be incremental and additive.
8. **No Secrets in Logs**: Never log passwords, tokens, API keys, or raw payment details.

---

## 1. Technology Baseline

- **Framework**: NestJS (pure backend application).
- **Language**: TypeScript (`strictNullChecks: true`, explicit types).
- **Database**: PostgreSQL (BIGINT identity primary keys, `snake_case` tables & columns).
- **ORM**: TypeORM with `SnakeNamingStrategy` and migration-driven schema management.
- **API Style**: REST APIs with webhooks and asynchronous background jobs.
- **Contract Boundary**: `@orgatick/contracts` package for shared Zod schemas, DTOs, response types, and enums.
- **Validation**: Zod (via `StandardSchemaValidationPipe` and `@Body({ schema })`). No `class-validator`.
- **Package Manager**: `pnpm` in Turborepo monorepo.

---

## 2. Architecture & Dependency Direction

```text
HTTP Request
    ↓
Controller (HTTP params, query, body, user extraction)
    ↓
Transport Validation (Zod schema validation pipe)
    ↓
Authentication / Authorization (Guards, tenant membership verification)
    ↓
Application / Business Service (Use cases, domain policies, orchestration)
    ↓
Repository (Persistence abstractions, query building)
    ↓
TypeORM (ORM mapping & transactions)
    ↓
PostgreSQL
```

### Rules:
- Controllers handle HTTP concerns only; they delegate immediately to services.
- Services own application and business behavior. A service may call another service when it represents a real business relationship.
- Repositories own persistence and query construction.
- Entities are persistence models, never API contracts.
- **Controllers must never inject or call repositories directly.**

```typescript
// ❌ WRONG: Controller directly calling repository
@Post()
create(@Body() dto: CreateEventDto) {
  return this.eventRepository.save(dto);
}

// ✅ CORRECT: Controller delegates to service with actor context
@Post()
create(
  @Body() dto: CreateEventDto,
  @CurrentUser() user: AuthenticatedUser,
) {
  return this.eventService.create(dto, user.id);
}
```

---

## 3. Module & Folder Structure

```text
apps/backend/src/
├── modules/
│   ├── identity/
│   ├── organization/
│   ├── events/
│   ├── ticketing/
│   ├── inventory/
│   ├── registrations/
│   ├── orders/
│   ├── payments/
│   ├── attendance/
│   ├── notifications/
│   ├── admin/
│   ├── risk/
│   └── analytics/
├── common/
├── infrastructure/
└── main.ts
```

Inside each domain module (e.g., `events/`):

```text
events/
├── controllers/
│   └── event.controller.ts
├── services/
│   └── event.service.ts
├── repositories/
│   └── event.repository.ts
├── entities/
│   └── event.entity.ts
├── dto/
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   └── list-event.dto.ts
├── enums/
│   └── event-status.enum.ts
└── event.module.ts
```

- Add folder structure when complexity requires it.
- **Do not let one module reach into another module's private folders.** Inter-module communication happens through exported services.

---

## 4. Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| Files | `kebab-case` | `event.controller.ts`, `event-publishing.service.ts` |
| Folders | `kebab-case` | `payment-providers/`, `ticket-inventory/` |
| Variables / properties | `camelCase` | `organizationId`, `ticketCount` |
| Functions / methods | `camelCase` | `createEvent()`, `findActiveMemberships()` |
| Classes | `PascalCase` | `EventService`, `EventRepository` |
| Types / interfaces | `PascalCase` | `EventResponse`, `CreateEventInput` |
| Enums | `PascalCase` | `EventStatus`, `PaymentState` |
| Database tables | `snake_case`, plural | `organization_members`, `ticket_reservations` |
| Database columns | `snake_case` | `created_at`, `organization_id` |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `REDIS_HOST` |
| Routes | lowercase resources | `/organizations/:id/events` |

Use domain-specific names. Avoid vague names like `data`, `item`, `manager`, `helper`, or `processor` when the concrete domain responsibility can be named.

---

## 5. File Size and Splitting

- **Under ~200 lines**: Normal and preferred if responsibility is coherent.
- **200–250 lines**: Review responsibility and dependency growth.
- **250+ lines**: Actively consider splitting into focused services, handlers, repositories, or submodules.
- **300+ lines**: Think twice — split immediately. Exceeding 300 lines indicates an architectural violation or missed separation of concerns.
- **Split by responsibility, not by method count.** Split when a class has multiple reasons to change, unrelated workflows, excessive dependencies, or large conditional trees.

```text
// ❌ WRONG: Monolithic dumping ground
event.service.ts (800+ lines)
  create()
  publish()
  cancel()
  export()
  sendEmail()
  processPayment()
  calculateAnalytics()

// ✅ CORRECT: Focused, cohesive services
event.service.ts               // CRUD & orchestration
event-publishing.service.ts    // Publishing workflow & verification
event-cancellation.service.ts  // Cancellation & refund trigger
event-export.service.ts        // CSV/report generation
```

---

## 6. SOLID, DRY, KISS, YAGNI

- **SOLID**: Single responsibility, explicit dependencies injected via constructor, replaceable abstractions for external providers.
- **DRY**: Single source of truth for contracts (`@orgatick/contracts`) and business rules. Similar-looking code is not automatically a reason for abstraction.
- **KISS**: Choose the simplest design that is correct, testable, and maintainable.
- **YAGNI**: No speculative features, generic frameworks, or premature abstractions before a concrete need exists.
- **Composition over inheritance**: Prefer composed services and interfaces over deep inheritance hierarchies.

```typescript
// ❌ WRONG: Premature generic abstractions
class GenericBaseService<T> { ... }
class GenericRepository<T> { ... }
class GenericManager<T> { ... }

// ✅ CORRECT: Domain-specific services
class TicketReservationService { ... }
class EventPublishingService { ... }
class PaymentService { ... }
```

---

## 7. TypeScript Rules

- **Avoid `any`**: Use `unknown` for untrusted external inputs and parse/validate with Zod before use.
- **No type assertions (`as Type`)** purely to silence the compiler.
- **Intentional nullability**: Explicitly handle `null | undefined`.
- **Readonly where applicable**: Prefer `readonly` properties for immutable structures.
- **Discriminated unions**: Use tagged unions for domain states (`{ status: 'success'; data: T } | { status: 'error'; error: E }`).
- **Do not export internal types** unless another module genuinely needs them.
- **Infer from Zod**: Derive TypeScript types from Zod schemas rather than writing duplicate interfaces.

```typescript
export const CreateEventRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  organizationId: z.string().regex(/^\d+$/),
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
```

---

## 8. `@orgatick/contracts` Boundary

`@orgatick/contracts` is the shared contract package across backend, frontend apps (`client`, `organizer`, `admin`), and future workers.

- **Put in contracts**: API request/response schemas, shared enums, pagination contracts, error contracts, webhook payload contracts.
- **NEVER put in contracts**: TypeORM entities, repositories, raw database queries, payment secrets, or backend business logic.
- **Entities ≠ Contracts**: Database schema and API wire representations must remain decoupled.

```typescript
// packages/contract/src/events/event.schema.ts
export const EventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: EventStatusSchema,
  createdAt: z.string().datetime(),
});

export type EventResponse = z.infer<typeof EventResponseSchema>;
```

---

## 9. Controllers

- Keep controllers thin (typically < 100 lines).
- Responsibilities: route declaration, parameter binding, DTO validation, invoking service, returning response.
- **Prohibited in controllers**:
  - Calculating fees, discounts, or commissions.
  - Reserving ticket inventory.
  - Processing payments or calling payment gateways.
  - Sending emails or notifications.
  - Calling database repositories directly.
  - Complex inline authorization logic (use `Guards` / policies).

---

## 10. Services

- Services own use cases and domain logic.
- Services coordinate repositories, domain policies, and helper services.
- **Services must be transport-agnostic**: Never inject Express `Request` or `Response` objects into services.
- Methods must be focused on one meaningful domain operation.

```typescript
async publishEvent(eventId: string, actorId: string): Promise<EventResponse> {
  const event = await this.eventRepository.findById(eventId);
  if (!event) throw new NotFoundException('Event not found');

  await this.organizationService.assertCanManageEvents(actorId, event.organizationId);
  this.eventPolicy.assertPublishable(event);

  const updated = await this.eventRepository.updateStatus(eventId, EventStatus.PUBLISHED);
  return this.eventMapper.toResponse(updated);
}
```

---

## 11. Repositories

- Repositories encapsulate query logic and persistence interactions.
- Repositories do **not** perform authorization, send emails, or handle HTTP.
- Prefer explicit, descriptive query method names.

```typescript
// ✅ CORRECT: Meaningful domain queries
findPublishedEvents(filter: EventListFilter): Promise<EventEntity[]>
findActiveReservationsByUserId(userId: string): Promise<TicketReservationEntity[]>

// ❌ WRONG: Vague generic queries
findEverything(options: any): Promise<any[]>
```

---

## 12. DTOs and Validation

- Validate all external input at the transport boundary with Zod schemas.
- Trim and normalize inputs within the schema.
- Frontend validation is a user experience enhancement; backend validation is the non-negotiable security boundary.
- Do not mix validation (shape & format) with authorization (user rights).

```typescript
export const CreateRegistrationRequestSchema = z.object({
  eventId: z.string().regex(/^\d+$/),
  ticketId: z.string().regex(/^\d+$/),
  contact: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().email(),
    phone: z.string().trim().min(5).max(20),
  }),
});
```

---

## 13. API Response and Error Standard

### Success:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-10-14T10:00:00.000Z"
}
```

### Error:
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "EVENT_REGISTRATION_CLOSED",
    "message": "Registration is closed for this event",
    "details": []
  },
  "timestamp": "2026-10-14T10:00:00.000Z"
}
```

- Always return predictable response envelopes.
- Use stable, machine-readable error codes (e.g., `INSUFFICIENT_INVENTORY`, `UNAUTHORIZED_ACCESS`).
- Client error messages must be sanitized and safe.
- **Never expose internal details**: No stack traces, raw SQL queries, or provider secret responses in API outputs.

---

## 14. Database Conventions

- PostgreSQL naming: `snake_case` everywhere.
- Tables: plural nouns (`events`, `orders`, `tickets`).
- Primary Keys: `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`.
- Foreign Keys: `<singular_table>_id` (e.g., `organization_id`, `event_id`).
- Timestamps: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- Add foreign key constraints, check constraints, and unique constraints for invariants.
- Index all foreign keys, status filters, and frequently sorted columns. Avoid speculative indexing.

```sql
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  title VARCHAR(200) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_events_status ON events(status);
```

---

## 15. TypeORM Conventions

- Map TypeScript `camelCase` properties to database `snake_case` columns explicitly or via `SnakeNamingStrategy`.
- `synchronize: false` in production; all schema changes must be migrations.
- Primary key representation: represent `BIGINT` as `string` in TypeScript to prevent JavaScript 64-bit precision loss.
- **Repository Methods Over QueryBuilder**:
  - Use standard repository methods (`find`, `findOne`, `save`, `update`, `delete`, `count`) for simple/standard queries.
  - Reserve `QueryBuilder` as the **last resort** for complex queries (e.g., complex multi-table joins, subqueries, dynamic aggregation).

```typescript
// ✅ PREFERRED: Standard repository method
const users = await this.userRepository.find({
  where: { isActive: true },
  order: { createdAt: 'DESC' },
  take: 10,
});

// ⚠️ LAST RESORT ONLY: Complex joins requiring QueryBuilder
const qb = this.eventRepository.createQueryBuilder('event')
  .leftJoinAndSelect('event.tickets', 'ticket')
  .where('event.status = :status', { status: EventStatus.PUBLISHED });
```

---

## 16. Transactions

- Wrap multi-table state mutations in atomic transactions (`dataSource.transaction(...)` or `@Transactional()`).
- **Keep transactions short**: Perform external HTTP calls, email sending, and file uploads *before* or *after* the transaction, NEVER inside.
- Use idempotency keys around payment operations.

```typescript
await this.dataSource.transaction(async (manager) => {
  // 1. Lock & reserve inventory
  // 2. Create order & order items
  // 3. Record reservation record
});
// 4. Send confirmation email AFTER transaction commits
```

---

## 17. Concurrency & Locking (Inventory & Ticketing)

Ticket reservations and inventory decrements are concurrency-critical. **A read-then-write check causes overselling.**

```text
// Conceptual Reservation Flow
BEGIN TRANSACTION
  SELECT * FROM ticket_inventory WHERE id = :id FOR UPDATE;
  IF available_capacity < requested_quantity THEN
    ROLLBACK;
    THROW InsufficientInventoryException;
  END IF;
  UPDATE ticket_inventory 
    SET reserved_capacity = reserved_capacity + :requested_quantity 
    WHERE id = :id;
  INSERT INTO ticket_reservations (...);
COMMIT TRANSACTION
```

- Use row-level locking (`FOR UPDATE`) or atomic conditional updates (`UPDATE ... WHERE available >= :qty`).
- Use unique constraints to prevent duplicate bookings.
- Define explicit reservation TTLs and background cleanup jobs.
- **Never rely on Redis/cache as the source of truth for available ticket capacity.**

---

## 18. Pagination, Filtering, and Sorting

- Collection endpoints must paginate.
- Standard query parameters: `page` (default: 1), `limit` (default: 20 or 50, capped at 100/250).
- Whitelist sortable and filterable fields. Reject unknown sort columns to prevent SQL injection.
- Standard response shape:
  ```json
  {
    "items": [ ... ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
  ```
- Use cursor-based pagination for high-volume or append-only event streams.

---

## 19. Rate Limiting Tiers

Rate limits must reflect abuse risk and resource intensity:

| Category | Tier | Example Endpoints |
| :--- | :--- | :--- |
| Authentication | Very Strict | Login, passkeys, MFA |
| Password Reset | Very Strict | Forgot password, reset submit |
| Registration / Checkout | Strict | Account creation, ticket checkout |
| Payment Operations | Strict | Charge creation, refund triggers |
| Public Discovery | Higher | List events, view country details |
| Admin Analytics | Controlled | Export reports, heavy metrics |
| Internal Workers | Service-specific | Webhook ingestion, cleanup crons |

Define policies in configuration (`RATE_LIMIT_POLICIES`); do not hardcode numbers inside controller methods.

---

## 20. Authentication, Authorization & Tenant Isolation

```text
Authenticated User (JWT / Session Cookie)
    ↓
Organization Membership Verification (Database / Cached Active Member)
    ↓
Role & Permission Check (e.g., event:create, finance:read)
    ↓
Object-Level Authorization (Does event belong to this organization?)
    ↓
Operation Allowed
```

- **Never trust client-supplied identity parameters**: Always extract `userId` from `request.user` and verify `organizationId` through verified membership context (`OrganizationContextGuard` / `@CurrentOrganization()`).
- Platform administrator permissions are strictly separated from organization tenant roles.
- Enforce tenant isolation at the query level (`WHERE organization_id = :orgId`).

---

## 21. Security Standards

- **Input Validation**: Strict Zod validation on all incoming query, param, and body data.
- **Parameterized Queries**: Never concatenate strings into SQL queries.
- **Log Hygiene**: Redact passwords, tokens, cookies, secret keys, and PAN/cardholder data.
- **Webhook Verification**: Validate HMAC signatures (e.g., Stripe, Resend) before processing. Reject replayed timestamps.
- **ID Enumeration Protection**: Sequential `BIGINT` IDs are internal identifiers. Use public UUIDs or hashed IDs where enumeration resistance is required.
- **Least Privilege**: Ensure the database user has only required privileges.

---

## 22. Logging and Observability

- Use structured JSON logs with correlation IDs (`requestId`).
- Log business-critical events: authentication attempts, role changes, payment statuses, and reservation failures.
- Redact sensitive data (`password`, `token`, `secret`, `creditCard`).
- Monitor API latency, P95/P99 times, queue backlog, and database connection pool saturation.

---

## 23. External Services & Webhooks

- Wrap external APIs (Stripe, Resend, Cloudflare R2) in provider adapters behind domain interfaces.
- Configure explicit timeouts and bounded retry limits.
- Persist provider event IDs to guarantee idempotent webhook processing.
- Process heavy webhook tasks asynchronously via background workers.

```text
PaymentService ──▶ PaymentProvider (interface) ──▶ StripePaymentProvider (adapter)
```

---

## 24. Caching

- Caching is an optimization layer, **never** the source of truth for financial, inventory, or tenant authorization state.
- Always define TTL and invalidation strategies simultaneously.
- Protect against cache stampedes on hot public keys.

---

## 25. Testing Strategy

| Level | Purpose | Orgatick Example |
| :--- | :--- | :--- |
| **Unit Tests** | Pure domain business rules & policies | Commission fee math, discount rules, status transition policies |
| **Integration Tests** | Database persistence & concurrency | Row locking, reservation race conditions, unique constraints |
| **API Tests** | Endpoints, pipes, filters & guards | Event creation route, organization context guard, validation failures |
| **E2E Tests** | Critical customer journeys | Register → reserve ticket → checkout → verify webhook → check-in |

Inventory reservations, payments, and tenant isolation require integration/API testing, not just mocked unit tests.

---

## 26. Git and Branching

```text
main
feature/event-ticket-configuration
feature/registration-custom-fields
fix/ticket-reservation-race-condition
refactor/payment-provider-adapter
chore/update-contracts
hotfix/payment-webhook
```

- Keep `main` releasable.
- Use focused, short-lived branches.
- Do not mix unrelated refactors into feature work.
- Migration changes must be reviewed with dependent code.
- Contract changes must consider every consumer across `apps/*`.

---

## 27. Commit Convention

```text
feat(events): add event creation
fix(ticketing): prevent reservation oversell
refactor(payments): extract provider adapter
chore(deps): update typeorm
docs(architecture): document reservation locking
test(registration): cover guest registration
```

- Avoid vague messages such as `'update'`, `'changes'`, or `'fix stuff'`.
- Keep commits logically coherent and scoped to the domain.

---

## 28. Pull Requests and Review

- Explain what changed and why.
- Keep PRs reviewable and focused on a single change set.
- Call out migration, API contract, security, concurrency, and performance impact explicitly.
- New business behavior requires tests.
- Breaking shared-contract changes require explicit multi-app review.
- Review criteria: correctness, authorization, tenant isolation, concurrency, performance, naming, and maintainability.

---

## 29. Database Migrations

- Design the schema for the current module/phase, then create migrations incrementally.
- Do not create speculative future tables upfront.
- Once a migration is applied to a shared environment, treat it as immutable history.
- Use additive/backward-compatible changes for zero-downtime deployment where required.
- Plan large indexes and high-volume table changes carefully.
- Separate destructive changes into safe multi-step deployment phases when old and new code must coexist.

---

## 30. Configuration and Secrets

- Validate required configuration at startup using Zod (`src/config/env.validation.ts`).
- Keep environment access behind a typed configuration boundary.
- Never commit secrets to the repository.
- Use separate credentials and data stores per environment.
- Fail fast when required configuration is missing.

```typescript
// ✅ YES:
configService.getOrThrow<string>('DATABASE_URL');

// ❌ NO:
process.env.DATABASE_URL; // scattered through business code
```

---

## 31. Documentation and ADRs

Record difficult-to-reverse architectural decisions and non-obvious behavior.

```text
docs/
└── architecture/
    ├── ADR-001-bigint-identifiers.md
    ├── ADR-002-shared-contracts.md
    ├── ADR-003-ticket-reservation-locking.md
    └── ADR-004-payment-commission.md
```

An ADR should state context, decision, alternatives considered, consequences, and status.

---

## 32. Anti-Patterns to Avoid

- ❌ Controller → Repository direct calls.
- ❌ Business logic in controllers.
- ❌ One giant service for unrelated domains.
- ❌ Premature `GenericBaseService`/`GenericRepository` abstractions.
- ❌ Database entities inside `@orgatick/contracts`.
- ❌ Duplicated API contracts across frontend and backend.
- ❌ Raw SQL fragments accepted from query parameters.
- ❌ Trusting client-supplied ownership IDs.
- ❌ Read-then-write inventory without concurrency control.
- ❌ Long database transactions containing slow external calls.
- ❌ Sensitive values in logs.
- ❌ One global rate limit for all endpoints.
- ❌ Cache as source of truth for inventory/payment state.
- ❌ TypeORM `synchronize` in production.
- ❌ Editing already-applied migrations.
- ❌ Creating all future module tables before implementation.

---

## 33. Complete Pattern Example: Event Creation

```typescript
// 1. Controller: HTTP handling only (event.controller.ts)
@Controller('organizations/:organizationId/events')
@UseGuards(OrganizationContextGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body({ schema: CreateEventSchema }) dto: CreateEventDto,
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventResponse> {
    return this.eventService.create(org.organizationId, user.id, dto);
  }
}

// 2. Service: Domain logic & orchestration (event.service.ts)
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly organizationService: OrganizationService,
    private readonly eventPolicy: EventPolicy,
    private readonly eventMapper: EventMapper,
  ) {}

  async create(
    organizationId: string,
    actorId: string,
    dto: CreateEventDto,
  ): Promise<EventResponse> {
    await this.organizationService.assertCanManageEvents(actorId, organizationId);
    this.eventPolicy.assertValidCreation(dto);

    const event = await this.eventRepository.create({
      organizationId,
      title: dto.title,
      description: dto.description,
      status: EventStatus.DRAFT,
    });

    return this.eventMapper.toResponse(event);
  }
}

// 3. Repository: Persistence boundary (event.repository.ts)
@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async create(data: Partial<EventEntity>): Promise<EventEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<EventEntity | null> {
    return this.repo.findOne({ where: { id } });
  }
}
```

*Controller handles HTTP. Service handles use case and business rules. Repository handles persistence. Mapper/contract boundary handles representation.*

---

## 34. Definition of Done Checklist

Before submitting a PR or considering a backend feature complete, verify:
- [ ] Correct module and naming conventions followed.
- [ ] No business logic or direct repository call in controller.
- [ ] Input validated with Zod schemas from `@orgatick/contracts`.
- [ ] Authorization and tenant isolation enforced server-side.
- [ ] Shared contract updated when API changes.
- [ ] Standard response/error envelope used.
- [ ] Database constraints and indexes reviewed.
- [ ] Transaction and locking strategy correct for concurrency-sensitive data.
- [ ] Tests cover new behavior and critical failure paths.
- [ ] Sensitive information absent from logs.
- [ ] Migration reviewed, incremental, and safe.
- [ ] PR focused and CI passing.

---

## 35. Quick Reference

- **Controller → Service**, never Controller → Repository.
- **Business logic** → Service / Domain Policy.
- **Persistence** → Repository (prefer standard repository methods over `QueryBuilder`).
- **PostgreSQL** → `snake_case`.
- **TypeScript** → `camelCase` variables/properties, `PascalCase` types/classes.
- **Files** → `kebab-case`.
- **Shared API contracts** → `@orgatick/contracts`.
- **Database entities ≠ API contracts**.
- **Validate external input** at the boundary.
- **Authorize server-side** on every request.
- **Paginate large collections** (`items` + `meta`).
- **Whitelist filters/sorts**.
- **Rate-limit by risk tier**.
- **Use transactions for atomic operations** (keep them short).
- **Use explicit concurrency controls** (row locking / atomic updates) for inventory.
- **Never log secrets**.
- **Never trust client ownership IDs**.
- **Test business-critical behavior** with integration/API tests.
- **Migrations are incremental and immutable history**.
- **Prefer simple code over premature abstraction**.
