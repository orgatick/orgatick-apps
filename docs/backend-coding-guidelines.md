**ORGATICK**

# **Backend Coding Guidelines**

*NestJS • TypeScript • PostgreSQL • TypeORM • Zod • REST • Webhooks*

**Engineering Standard | Backend only | Version 1.0**

# **How to use this document**

This is the engineering standard for the Orgatick backend. It defines how code is structured, named, validated, tested, secured, reviewed and evolved. It is intentionally practical: every important rule should be understandable from an example.

* Follow these rules unless an approved architecture decision creates an exception.  
* Design ahead, implement incrementally. Do not create speculative modules or database tables.  
* Security, tenant isolation, concurrency and financial correctness are non-negotiable.

# **1\. Technology baseline**

* Pure NestJS backend application.  
* TypeScript.  
* PostgreSQL.  
* TypeORM.  
* REST APIs, with webhooks and asynchronous integrations where appropriate.  
* Private shared @orgatick/contracts package for API contracts, schemas, response types and shared enums.  
* Zod for shared schema definitions.  
* pnpm as package manager.

# **2\. Architecture and dependency direction**

HTTP Request  
  ↓  
Controller  
  ↓  
Transport validation  
  ↓  
Authentication / Authorization  
  ↓  
Application / Business Service  
  ↓  
Repository  
  ↓  
TypeORM  
  ↓  
PostgreSQL

* Controllers handle HTTP concerns only.  
* Services own application and business behavior.  
* Repositories own persistence/query behavior.  
* Entities are persistence models, not API contracts.  
* A service may call another service when that dependency represents a real business/application relationship.  
* Controllers must never call repositories directly.

`// no:`   
`@Post()`  
`create(@Body() dto: CreateEventDto) {`  
  `return this.eventRepository.save(dto);`  
`}`

`// Correct:`  
`@Post()`  
`create(@Body() dto: CreateEventDto) {`  
  `return this.eventService.create(dto, this.currentUser.id);`  
`}`

# 

# **3\. Module and folder structure**

src/  
├── modules/  
│   ├── identity/  
│   ├── organizations/  
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

Do not create every possible folder in every module. Add structure when complexity requires it. Do not let one module reach into another module's private folders.

# **4\. Naming conventions**

| Item | Convention | Example |
| :---- | :---- | :---- |
| Files | kebab-case | event.controller.ts |
| Folders | kebab-case | payment-providers/ |
| Variables / properties | camelCase | organizationId |
| Functions | camelCase | createEvent() |
| Classes | PascalCase | EventService |
| Types / interfaces | PascalCase | EventResponse |
| Enums | PascalCase | EventStatus |
| Database tables | snake\_case, plural | organization\_members |
| Database columns | snake\_case | created\_at |
| Environment variables | UPPER\_SNAKE\_CASE | DATABASE\_URL |
| Routes | lowercase resources | /organizations/:id/events |

Use domain-specific names. Avoid vague names such as data, item, manager, helper or processor when the actual responsibility can be named.

# **5\. File size and splitting**

* Under \~200 lines: normally fine if responsibility is coherent.  
* 200–300 lines: review responsibility and dependency growth.  
* 300–500 lines: actively consider splitting.  
* 500+ lines: normally split unless there is a strong documented reason.  
* Line count is a signal, not the only rule. Split when a class has multiple reasons to change, unrelated workflows, many dependencies, large conditional trees or becomes hard to test.  
* Split by responsibility, not by arbitrary method count.

`// Wrong: One service becomes a dumping ground`  
`event.service.ts`  
  `create()`  
  `publish()`  
  `cancel()`  
  `export()`  
  `sendEmail()`  
  `processPayment()`  
  `calculateAnalytics()`

`// Correct: Split by real responsibility`  
`event.service.ts`  
`event-publishing.service.ts`  
`event-cancellation.service.ts`  
`event-export.service.ts`

# **6\. SOLID, DRY, KISS and YAGNI**

## **SOLID**

Use focused responsibilities, explicit dependencies and replaceable abstractions where replacement is meaningful.

## **DRY**

Keep one source of truth for contracts and business rules. Similar-looking code is not automatically a reason for abstraction.

## **KISS**

Choose the simplest design that is correct, testable and maintainable.

## **YAGNI**

Do not build speculative features, generic frameworks or abstractions before a concrete need exists.

## **High cohesion / low coupling**

Keep code that changes together, and depend on stable boundaries rather than internal details.

## **Composition over inheritance**

Prefer composed services and interfaces over deep inheritance hierarchies.

`// Wrong: Premature abstraction`  
`GenericBaseService<T>`  
`GenericRepository<T>`  
`GenericManager<T>`

`// Correct: Prefer a domain-specific service until a stable shared behavior exists`  
`TicketReservationService`  
`EventPublishingService`  
`PaymentService`

# **7\. TypeScript rules**

* Avoid any. Use unknown for genuinely unknown external data and validate it.  
* Avoid type assertions used only to silence the compiler.  
* Keep nullability intentional.  
* Prefer readonly data where mutation is not required.  
* Use discriminated unions for meaningful state variants.  
* Do not export internal types unless another module genuinely needs them.  
* Infer types from Zod schemas rather than maintaining duplicate interfaces.

`const CreateEventRequestSchema = z.object({`  
  `title: z.string().trim().min(1).max(200),`  
  `organizationId: z.number().int().positive(),`  
`});`

`type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;`

# **8\. @orgatick/contracts**

@orgatick/contracts is the shared contract boundary for the frontend, backend, admin application and future workers.

* Put API request/response schemas, shared enums, pagination contracts, error contracts and webhook contracts here.  
* Do not put TypeORM entities, repositories, database queries, payment secrets or backend business logic here.  
* Do not create a second independent definition of the same API contract in frontend and backend.  
* A database entity and API response are different representations.

`// @orgatick/contracts/events`  
`export const EventResponseSchema = z.object({`  
  `id: z.number().int().positive(),`  
  `title: z.string(),`  
  `status: EventStatusSchema,`  
  `createdAt: z.string().datetime(),`  
`});`

`export type EventResponse = z.infer<typeof EventResponseSchema>;`

# **9\. Controllers**

* Keep controllers thin.  
* Extract route params, query, body and authenticated user context.  
* Delegate to services.  
* Do not calculate commission, reserve inventory, process payments, send notifications or write repositories from controllers.  
* Do not put complex authorization decisions inline; use guards/policies/services.  
* Return the standard response contract.

# **10\. Services**

* Services own use cases and business rules.  
* Services may coordinate repositories and other services.  
* Services must not depend on HTTP response objects or framework-specific transport details.  
* Keep methods focused on one meaningful operation.  
* A service should not become a catch-all for unrelated domains.

async publishEvent(eventId: number, actorId: number) {  
  const event \= await this.eventRepository.findById(eventId);  
  await this.organizationService.assertCanManageEvents(actorId, event.organizationId);  
  this.eventPolicy.assertPublishable(event);  
  return this.eventRepository.publish(eventId);  
}

# **11\. Repositories**

* Repositories handle persistence and query construction.  
* Repositories do not perform authorization.  
* Repositories do not send emails, call payment providers or implement HTTP behavior.  
* Prefer explicit, meaningful query methods.

`// Correct: findPublishedEvents(filter: EventListFilter): Promise<Event[]>`

`// Wrong: findEverything(options: any): Promise<any[]>`

# **12\. DTOs and validation**

* Validate every external input.  
* Trim and normalize only where the contract requires it.  
* Validate ranges, enums, formats and nested structures.  
* Do not confuse validation with authorization.  
* Frontend validation is a UX feature, not a security boundary.  
* Shared Zod schemas should remain the source of truth for shared API contracts.

`const CreateRegistrationRequestSchema = z.object({`  
  `eventId: z.number().int().positive(),`  
  `ticketId: z.number().int().positive(),`  
  `contact: z.object({`  
    `name: z.string().trim().min(1),`  
    `email: z.email(),`  
    `phone: z.string().trim().min(5),`  
  `}),`  
`});`

# **13\. API response and error standard**

`// Success`  
`{`  
  `"success": true,`  
  `"data": {}`  
`}`

`// Error`  
`{`  
  `"success": false,`  
  `"error": {`  
    `"code": "EVENT_REGISTRATION_CLOSED",`  
    `"message": "Registration is closed for this event",`  
    `"details": []`  
  `}`  
`}`

* Use a consistent response envelope.  
* Use stable machine-readable error codes.  
* Client messages must be safe and understandable.  
* Unexpected errors become a generic internal error response while diagnostics go to structured logs.  
* Never return stack traces, SQL, provider responses containing secrets or internal implementation details.

# **14\. Database conventions**

* PostgreSQL names use snake\_case.  
* Tables are normally plural nouns.  
* Primary keys use BIGINT identity consistently.  
* Foreign keys use \<singular\_table\>\_id.  
* Use created\_at and updated\_at consistently where applicable.  
* Use database constraints for invariants that must always hold.  
* Add indexes based on real query patterns, not speculation.  
* Avoid nullable columns when a value is required for the domain state.

`CREATE TABLE events (`  
  `id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,`  
  `organization_id BIGINT NOT NULL REFERENCES organizations(id),`  
  `title VARCHAR(200) NOT NULL,`  
  `created_at TIMESTAMPTZ NOT NULL DEFAULT now(),`  
  `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`  
`);`

# **15\. TypeORM conventions**

* Entities are persistence models, not API contracts.  
* Map TypeScript camelCase to PostgreSQL snake\_case explicitly.  
* Use migrations for schema changes. Never rely on synchronization in production.  
* Configure relations intentionally; avoid accidental eager loading of large graphs.  
* Use repositories for persistence boundaries.  
* Avoid using TypeORM QueryBuilder when standard find, where, and Repository methods can achieve the same result. Prefer repository methods for simple queries (e.g., `const users = await userRepository.find({ where: { isActive: true }, order: { createdAt: 'DESC' }, take: 10 })`). QueryBuilder should be reserved as the absolute last resort for complex queries where standard repository methods are insufficient.

`@Entity('events')`  
`export class EventEntity {`  
  `@PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })`  
  `id: string;`

  `@Column({ name: 'organization_id', type: 'bigint' })`  
  `organizationId: string;`  
`}`

BIGINT representation must be consistent with the chosen TypeORM/driver behavior. If BIGINT is represented as string to avoid JavaScript precision problems, use that representation everywhere in the backend rather than mixing number and string.

# **16\. Transactions**

Use a transaction when multiple database changes must succeed or fail as one business operation.

`await dataSource.transaction(async (manager) => {`  
  `// create order`  
  `// create order items`  
  `// update transactional state`  
`});`

* Keep transactions short.  
* Do not hold a database transaction open while waiting on slow external services unless explicitly justified.  
* Use idempotency and reconciliation around external payment operations.  
* Understand isolation and locking for inventory and financial operations.

# **17\. Concurrency and locking**

Ticket inventory and reservations are concurrency-sensitive. A read-then-write availability check is not sufficient.

`// Conceptual flow`  
`BEGIN`  
  `lock inventory row`  
  `verify available capacity`  
  `create reservation`  
  `reserve/decrement capacity atomically`  
`COMMIT`

* Use row-level locking or atomic conditional updates where appropriate.  
* Use unique constraints to enforce uniqueness under concurrency.  
* Define reservation expiry and cleanup.  
* Handle deadlocks/transient database errors with bounded retries where safe.  
* Make payment webhooks and other state-changing callbacks idempotent.  
* Never use stale cache as the source of truth for inventory.

# **18\. Pagination, filtering and sorting**

Any endpoint that can return a large collection must paginate. The pagination query format should be consistent.

`GET /events?page=2&limit=20&status=published&categoryId=10&search=conference`

`{`  
  `"success": true,`  
  `"data": [],`  
  `"pagination": {`  
    `"page": 2,`  
    `"limit": 20,`  
    `"total": 245,`  
    `"totalPages": 13`  
  `}`  
`}`

* Validate page and limit bounds.  
* Whitelist filter and sort fields.  
* Index important filter/sort paths.  
* Use cursor pagination for very large/high-write collections when offset becomes inefficient.  
* Never pass raw SQL through query parameters.  
* Keep the common pagination query naming consistent even when endpoint-specific filters differ.

# **19\. Rate limiting**

Authentication      → very strict  
Password reset      → very strict  
Registration        → strict  
Payment operations  → strict  
Public discovery    → higher  
Admin analytics     → controlled  
Internal workers    → service-specific

Rate limits are selected by abuse risk and resource cost. They belong in configuration, must be observable and should not be scattered as magic numbers through controllers.

# **20\. Authentication, authorization and tenant isolation**

* Authentication identifies the caller; authorization decides what the caller may do.  
* Never trust client-supplied userId, organizationId, eventId or ticketId as proof of ownership.  
* Every organization-scoped operation must verify membership and permission.  
* Platform-admin privileges are distinct from organization roles.  
* Object-level authorization must happen before returning or modifying protected resources.  
* Tenant isolation must be enforced server-side in every relevant service/repository path.

Authenticated user  
    ↓  
Organization membership  
    ↓  
Permission  
    ↓  
Resource access  
    ↓  
Operation allowed

# **21\. Security**

* Validate all external input.  
* Use parameterized TypeORM/database APIs.  
* Never log passwords, tokens, secrets or raw payment credentials.  
* Keep organization documents private and access-controlled.  
* Verify webhook signatures and protect against replay.  
* Rate-limit authentication, registration, payment and expensive operations.  
* Use least privilege for database/service accounts.  
* Sequential BIGINT IDs are identifiers, not secrets. Use a separate public reference where enumeration resistance is required.  
* Protect file uploads by type, size, storage access and malware controls where applicable.  
* Do not expose internal exception details.

# **22\. Logging and observability**

* Use structured logs.  
* Propagate request/correlation IDs.  
* Log security, financial, governance and operational events that require auditability.  
* Redact sensitive values.  
* Do not log complete request bodies by default.  
* Monitor API latency, errors, queue backlog, payment failures, reservation contention and webhook failures.

# **23\. External services and webhooks**

* Use provider adapters when provider replacement is plausible.  
* Apply timeouts and bounded retries.  
* Never blindly retry non-idempotent operations.  
* Verify webhook signatures before changing state.  
* Persist provider event IDs for idempotency.  
* Process heavy webhook work asynchronously where practical.  
* Use a recoverable failure/dead-letter state for repeated delivery failures.  
* Keep provider credentials outside @orgatick/contracts.

PaymentService  
      ↓  
PaymentProvider interface  
      ↓  
StripePaymentProvider  
OtherPaymentProvider

# **24\. Caching**

* Cache only when consistency requirements are understood.  
* Define TTL and invalidation together.  
* Never use cache as the source of truth for ticket inventory or payment state.  
* Protect hot keys from stampedes.  
* Measure cache hit rate and invalidation failures.  
* Start with read-heavy public event data before introducing complex caching.

# 

# **25\. Testing strategy**

| Level | Purpose | Orgatick example |
| :---- | :---- | :---- |
| Unit | Pure business rules | Commission calculation, event policy |
| Integration | Database behavior | Reservation locks, unique constraints |
| API | HTTP \+ authorization | Create event, list registrations |
| E2E | Critical journey | Register → pay → ticket → check-in |

Business-critical areas such as ticket inventory, payments, registrations, authorization and tenant isolation require integration/API coverage, not only mocked unit tests.

# **26\. Git and branching**

`main`  
`feature/event-ticket-configuration`  
`feature/registration-custom-fields`  
`fix/ticket-reservation-race-condition`  
`refactor/payment-provider-adapter`  
`chore/update-contracts`  
`hotfix/payment-webhook`

* Keep main releasable.  
* Use focused, short-lived branches.  
* Do not mix unrelated refactors into feature work.  
* Migration changes must be reviewed with dependent code.  
* Contract changes must consider every consumer.

# **27\. Commit convention**

`feat(events): add event creation`  
`fix(ticketing): prevent reservation oversell`  
`refactor(payments): extract provider adapter`  
`chore(deps): update typeorm`  
`docs(architecture): document reservation locking`  
`test(registration): cover guest registration`

Avoid vague messages such as 'update', 'changes' or 'fix stuff'. Keep commits logically coherent.

# **28\. Pull requests and review**

* Explain what changed and why.  
* Keep PRs reviewable.  
* Call out migration, API contract, security, concurrency and performance impact.  
* New business behavior requires tests.  
* Breaking shared-contract changes require explicit review.  
* Review correctness, authorization, tenant isolation, concurrency, performance, naming and maintainability.

# **29\. Database migrations**

* Design the schema for the current module/phase, then create migrations incrementally.  
* Do not create every future table upfront.  
* Once a migration is applied to a shared environment, treat it as immutable history.  
* Use additive/backward-compatible changes for zero-downtime deployment where required.  
* Plan large indexes and high-volume table changes carefully.  
* Separate destructive changes into safe deployment phases when old and new code must coexist.

# **30\. Configuration and secrets**

* Validate required configuration at startup.  
* Keep environment access behind a typed configuration boundary.  
* Never commit secrets.  
* Use separate credentials and data stores per environment.  
* Fail fast when required configuration is missing.

`// yes: configService.getOrThrow<string>('DATABASE_URL')`

`// no: process.env.DATABASE_URL // scattered through business code`

# **31\. Documentation and ADRs**

Record difficult-to-reverse architectural decisions and non-obvious behavior.

docs/  
└── architecture/  
    ├── ADR-001-bigint-identifiers.md  
    ├── ADR-002-shared-contracts.md  
    ├── ADR-003-ticket-reservation-locking.md  
    └── ADR-004-payment-commission.md

An ADR should state context, decision, alternatives considered, consequences and status.

# **32\. Anti-patterns**

* Controller → Repository direct calls.  
* Business logic in controllers.  
* One giant service for unrelated domains.  
* Premature GenericBaseService/GenericRepository abstractions.  
* Database entities inside @orgatick/contracts.  
* Duplicated API contracts across frontend and backend.  
* Raw SQL fragments accepted from query parameters.  
* Trusting client-supplied ownership IDs.  
* Read-then-write inventory without concurrency control.  
* Long database transactions containing slow external calls.  
* Sensitive values in logs.  
* One global rate limit for all endpoints.  
* Cache as source of truth for inventory/payment state.  
* TypeORM synchronize in production.  
* Editing already-applied migrations.  
* Creating all future module tables before implementation.

# **33\. Complete example: event creation**

`// event.controller.ts`  
`@Post()`  
`async create(`  
  `@Body() dto: CreateEventDto,`  
  `@CurrentUser() user: AuthenticatedUser,`  
`) {`  
  `return this.eventService.create(dto, user.id);`  
`}`

`// event.service.ts`  
`async create(dto: CreateEventDto, actorId: string) {`  
  `await this.organizationService.assertCanManageEvents(`  
    `actorId,`  
    `dto.organizationId,`  
  `);`

  `this.eventPolicy.assertValidCreation(dto);`

  `const event = await this.eventRepository.create({`  
    `organizationId: dto.organizationId,`  
    `title: dto.title,`  
  `});`

  `return this.eventMapper.toResponse(event);`  
`}`

`// event.repository.ts`  
`async create(data: CreateEventData): Promise<EventEntity> {`  
  `const entity = this.repository.create(data);`  
  `return this.repository.save(entity);`  
`}`

Controller handles HTTP. Service handles the use case and business rules. Repository handles persistence. Mapper/contract boundary handles representation.

# **34\. Definition of done**

* Correct module and naming conventions.  
* No business logic or direct repository call in controller.  
* Input validated.  
* Authorization and tenant isolation enforced.  
* Shared contract updated when API changes.  
* Standard response/error envelope used.  
* Database constraints/indexes reviewed.  
* Transaction/locking strategy correct.  
* Tests cover new behavior and important failure paths.  
* Sensitive information absent from logs.  
* Migration reviewed and safe.  
* PR focused and CI passing.

# **35\. Quick reference**

* Controller → Service, never Controller → Repository.  
* Business logic → Service/domain policy.  
* Persistence → Repository.  
* PostgreSQL → snake\_case.  
* TypeScript → camelCase variables/properties, PascalCase types/classes.  
* Files → kebab-case.  
* Shared API contracts → @orgatick/contracts.  
* Database entities ≠ API contracts.  
* Validate external input.  
* Authorize server-side.  
* Paginate large collections.  
* Whitelist filters/sorts.  
* Rate-limit by risk.  
* Use transactions for atomic operations.  
* Use explicit concurrency controls for inventory.  
* Never log secrets.  
* Never trust client ownership IDs.  
* Test business-critical behavior.  
* Migrations are an incremental and immutable history.  
* Prefer simple code over premature abstraction.

# **Document status**

Version 1.0. Backend-only standard. Frontend-specific standards should be maintained separately while consuming the same @orgatick/contracts and API conventions.
