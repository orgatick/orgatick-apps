# apps/backend — NestJS

NestJS 12, TypeORM (PostgreSQL), Redis, Resend, R2. Port `5050`. Entrypoint
`src/main.ts`. No Swagger decorators are in use yet.

## Bootstrap

`src/main.ts` is short and tells you the global setup:

```ts
initializeTransactionalContext();                      // typeorm-transactional
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  forceCloseConnections: true, instrument: ObserveInstrument,
});
app.set("trust proxy", true);                          // Cloudflare / LB IP resolution
app.use(cookieParser());
app.enableCors({ origin: true, credentials: true });
app.useGlobalPipes(new StandardSchemaValidationPipe()); // Zod validation, no class-validator
app.enableShutdownHooks();
await app.listen(process.env.PORT ?? 5050);
```

Consequences to keep in mind:

- **Validation is Zod-only.** `StandardSchemaValidationPipe` accepts any
  Standard Schema, so `@Body({ schema: XSchema })` works and `class-validator`
  DTOs are not used anywhere in this codebase.
- **`trust proxy` is on**, so rate limiting and IP extraction use `X-Forwarded-For`.
- CORS is credentialed — the frontend sends cookies.

`src/app.module.ts` registers the global providers, in this order:

| Provider                          | File                                                |
| --------------------------------- | --------------------------------------------------- |
| `AuthenticationGuard` (APP_GUARD) | `src/modules/authentication/guards/authentication.guard.ts` |
| `RateLimitGuard` (APP_GUARD)      | `src/infrastructure/rate-limit/guards/rate-limit.guard.ts` |
| `AllExceptionsFilter` (APP_FILTER)| `src/common/filters/http-exception.filter.ts`       |
| `TransformInterceptor` (APP_INTERCEPTOR) | `src/common/interceptors/transform.interceptor.ts` |

Global infrastructure modules: `configModule`, `databaseModule`, `cacheModule`,
`RateLimitModule`, plus feature modules (`UsersModule`, `IdentityModule`,
`AuthenticationModule`, `AddressModule`, `OrganizationModule`) and
`ObserveModule` (observability).

## Module layout convention

Feature modules live under `src/modules/<domain>/`. Inside a feature, the folder
names are consistent **even though some features predate the convention and use
singular forms** — mirror whichever form the neighbouring module uses.

The current canonical (plural) shape, from `src/modules/address/`:

```text
src/modules/address/
├── address.module.ts
├── controllers/countries.controller.ts
├── entities/countries.entity.ts
├── repositories/countries.repository.ts
└── services/countries.service.ts
```

Plural (preferred, used by `address`, `authentication`, `organization/*`):
`controllers/ services/ repositories/ entities/ dto/ enums/ types/ interfaces/`

Singular legacy forms also exist — `src/modules/users/{controller,service,repositories}`,
`src/modules/identity/{controller,service}`. Do not rename them as a side effect
of your feature; match local style instead.

Naming within a feature: files are kebab-case and **plural for repositories and
entities** (`countries.repository.ts`, `countries.entity.ts`) while controller
files are singular-by-domain (`countries.controller.ts`). Class names are
singular: `CountriesController`, `CountriesService`, `CountriesRepository`,
`Country`.

Nested domain modules are grouped one level deeper, e.g.
`src/modules/organization/{organization, organization-admin, organization-category,
organization-finance, organization-governance, organization-invitation,
organization-member, organization-session, context}`. `OrganizationModule` is a
thin barrel that imports and re-exports its sub-modules.

## Controller conventions

Controllers are thin: validate, delegate to a service, return. No query building,
no business rules.

```ts
@Controller("countries")
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Get()
  async findAll(
    @Query({ schema: QueryCountrySchema }) query: QueryCountryDto,
  ): Promise<PaginatedResult<CountryDetailResponse>> {
    return await this.countriesService.findAll(query);
  }

  @Public()
  @Get(":codeOrId")
  async findOne(@Param("codeOrId") codeOrId: string): Promise<CountryDetailResponse> {
    return await this.countriesService.findByCodeOrId(codeOrId);
  }
}
```

Rules observed across controllers:

- `@Controller("<plural-resource>")` — no version prefix, no `api/` segment.
  Routes are `GET /countries`, `GET /organizations/:idOrSlug`,
  `GET /admin/organizations`, `GET /identity/devices`, `GET /session/organization`.
- Platform-admin endpoints are namespaced under `admin/`
  (`@Controller("admin/organizations")`) **and** guarded with `PlatformAdminGuard`.
- Validation binds the shared schema: `@Body({ schema: XSchema }) dto: XDto`,
  `@Query({ schema: XSchema }) query: XDto`, `@Param(...)`.
- **Every route requires authentication unless marked `@Public()`.**
  `@Public()` comes from `@/common/decorators/public.decorator` and is checked via
  `Reflector.getAllAndOverride` on handler then class.
- `@Req() req: AuthRequest` is how you reach the authenticated user and session.
  `AuthRequest` (from `@/common/types/auth-request.types`) is `Request` plus
  `user: User` and `session: UserSession`.
- Route ordering matters: literal segments before params (`@Get("my")` is declared
  before `@Get(":idOrSlug")` in `organization.controller.ts`).
- Static members (non-`GET`) return the plain domain object; the interceptor wraps it.

### File uploads

`POST /organizations` takes `multipart/form-data`: a JSON `data` field plus files.

```ts
@Post()
@UseInterceptors(
  AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 1024 * 1024 * 10 } }),
  FormDataJsonInterceptor,
)
async create(
  @Req() req: AuthRequest,
  @Body({ schema: CreateOrganizationSchema }) dto: CreateOrganizationDto,
  @UploadedFiles() files?: Express.Multer.File[],
) { ... }
```

`FormDataJsonInterceptor` parses the JSON string in `req.body.data` (or
`req.body.organizationData`) and merges it into the body before the validation pipe.
Use `memoryStorage()`, not disk.

## Response envelope

`TransformInterceptor` wraps **every** successful response:

```json
{ "success": true, "statusCode": 200, "data": <payload or null>, "timestamp": "<ISO>" }
```

So a controller returning a `PaginatedResult<T>` produces
`{ success, statusCode, data: { items, total, page, limit, totalPages }, timestamp }`.
Consumers must read `response.data.data` on the frontend — that double nesting is
expected, not a bug.

On error, `AllExceptionsFilter` (`@Catch()`) emits:

```json
{
  "success": false,
  "statusCode": <http status>,
  "error": "<message>",
  "code": "<optional>",
  "retryAfter": <optional>,
  "path": "<request url>",
  "timestamp": "<ISO>"
}
```

Unrecognized exceptions log a stack and return `500` with
`"error": "Internal server error"`. Note the error shape uses `error` while the
success shape uses `data`; the frontend's `getApiErrorMessage` reads `message`,
`error`, and `errors`.

**bigint caveat:** the interceptor does not serialize `bigint`. Entities use
`bigint` primary keys, so services must map ids to something JSON-safe before
returning. `mapToResponse` in the address services returns ids via the response
types; the organization-context code explicitly notes to `String(...)` ids before
they leave the process. When you add a response mapping, check how it handles ids.

## Service conventions

Services own business rules, pagination arithmetic, and entity → response mapping.

```ts
@Injectable()
export class CountriesService {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async findAll(query: QueryCountryDto): Promise<PaginatedResult<CountryDetailResponse>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(250, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const [countries, total] = await this.countriesRepository.findPaginated({
      skip, take: limit, search: query.search, continentCode: query.continentCode, isActive: query.isActive,
    });

    return {
      items: countries.map((c) => this.mapToResponse(c)),
      total, page, limit, totalPages: Math.ceil(total / limit),
    };
  }

  private mapToResponse(c: Country): CountryDetailResponse { /* explicit field copy */ }
}
```

- Return `PaginatedResult<T>` from list endpoints, computed as above.
- `mapToResponse` / `toResponse` is a private method on the service; the shared
  `to-address-response` helper in `packages/contract` does the same job for
  addresses.
- Throw Nest HTTP exceptions for expected failures (`NotFoundException`,
  `ForbiddenException`, `UnauthorizedException`, `ConflictException`).
- Repositories are injected as classes, not via `@InjectRepository` in the service.

## Repository conventions

Repositories wrap `Repository<T>` and are the only place query builders appear.

```ts
@Injectable()
export class CountriesRepository {
  constructor(@InjectRepository(Country) private readonly repo: Repository<Country>) {}

  async findPaginated(options: CountryFindOptions): Promise<[Country[], number]> {
    const qb: SelectQueryBuilder<Country> = this.repo.createQueryBuilder("country");
    if (options.search) {
      qb.andWhere("(country.name ILIKE :search OR country.code ILIKE :search)", { search: `%${options.search}%` });
    }
    qb.orderBy("country.name", "ASC").skip(options.skip).take(options.take);
    return await qb.getManyAndCount();
  }
}
```

- Alias the query builder (`"country"`) and reference columns with **snake_case**
  in raw strings (`country.continent_code`), because the naming strategy maps
  property names to snake columns.
- `*FindOptions` types (`CountryFindOptions`) live in `packages/contract` under
  `<domain>/options/` and use `skip`/`take`, not `page`/`limit`. The service
  converts.
- Return tuples (`getManyAndCount`) rather than embedding pagination in the repo.

## TypeORM setup

Two entry points share the same options — keep them in sync:

- `src/database/config/orm.config.ts` — runtime config used by `databaseModule`.
  `autoLoadEntities: true`, `synchronize: false`, `migrationsRun: false`,
  `SnakeNamingStrategy`, `dataSourceFactory` wraps the DataSource in
  `addTransactionalDataSource` so `@Transactional()` works.
- `src/data-source.ts` — CLI/migration/seed entry point. Same connection options,
  plus the explicit `seeds` array. Uses `typeorm-extension`'s `SeederOptions`.

Both use `SnakeNamingStrategy` from `typeorm-naming-strategies`, so
`@Column()` without `name` still maps to snake_case; explicit `name` is used
throughout anyway.

Entities:

- `@Entity("table_name", { schema: "domain" })` — schemas are used
  (`identity`, `address`, and others per feature). Keep the schema name.
- `@PrimaryGeneratedColumn({ type: "bigint" }) id!: bigint` — ids are bigint
  throughout; property types use `bigint`, optional columns are `?: T | null`.
- `@CreateDateColumn({ name: "created_at", type: "timestamp" })`.
- Indexes declared with explicit names: `@Index("IDX_addresses_country_id", ["countryId"])`.
- Relations via `@ManyToOne(() => Country) @JoinColumn({ name: "country_id" })`.

Transactions use `typeorm-transactional`'s `@Transactional()` with
`StorageDriver.ASYNC_LOCAL_STORAGE`. `initializeTransactionalContext()` runs in both
`main.ts` and `data-source.ts` — do not add a third.

## Migrations and seeders

Migrations live in `src/database/migrations/<timestamp>-<Name>.ts`, hand-written
with `queryRunner.createTable(new Table({...}))` and a matching `down()`:

```ts
export class CreateUserAccounts1787812783789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "user_accounts", schema: "identity",
      columns: [
        { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
        { name: "user_id", type: "bigint", isNullable: false },
        { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
      ],
    }), true);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(new Table({ name: "user_accounts", schema: "identity" }), true);
  }
}
```

Seeders are classes registered in the `seeds` array in `src/data-source.ts`:
`CountriesSeeder`, `AdministrativeDivisionsSeeder`, `CitiesSeeder`,
`OrganizationCategoriesSeeder`, `PermissionsSeeder`, `RolesSeeder`. They live in
`src/database/seeder/` (data files under `src/database/seeder/data/` are
Biome-ignored). Seed logic for permissions/roles lives in
`src/common/authorization/seeds/{permission.seed.ts,role.seed.ts}`.

Schema reference material is checked in at `src/database/schema/orgatick.dbml` and
`orgatick.chartdb.json`; ChartDB runs via `pnpm chartdb` in the backend workspace.

## Auth, permissions, rate limiting

`AuthenticationGuard` runs globally and, for non-public routes, reads the access
token from cookies (`CookieService.getAccessToken`), verifies it
(`TokenService.verifyAccessToken`), loads the user, and validates the session
(`SessionService.validateSession`) before setting `request.user` / `request.session`.
Failures clear auth cookies and throw `UnauthorizedException`.

Authorization is layered:

- `PlatformAdminGuard` — checks `request.user.role === PlatformRole.ADMIN`; throws
  `ForbiddenException`. Applied with `@UseGuards(PlatformAdminGuard)` on
  `admin/*` controllers.
- `@RequirePermission(...keys)` (`src/common/authorization/decorators`) sets metadata
  read by `PermissionGuard`. Permission keys are `"resource:action"` strings
  declared per domain in `src/common/authorization/permissions/*.permissions.ts`
  (e.g. `ORGANIZATION_PERMISSIONS.UPDATE = "organization:update"`), collected in
  `PERMISSIONS` / `PERMISSION_DEFINITIONS` and typed as `PermissionKey`.
  **Caveat: `PermissionGuard.canActivate` currently returns `true`
  unconditionally — the check is a stub.** Do not rely on it to protect an
  endpoint; use explicit role/membership logic (or the organization-context guard)
  until it is implemented.
- `OrganizationContextGuard` + `@CurrentOrganization()` scope a controller to the
  user's active organization. Read the `organization-context` skill before using it.

Rate limiting is global (`RateLimitGuard`) with per-policy overrides:

```ts
@RateLimit(AUTH_RATE_LIMIT_POLICIES.passwordReset)  // apply specific policies
@SkipRateLimit()                                     // bypass entirely
```

Policies live in `src/infrastructure/rate-limit/constants/policies/` and are
aggregated in `constants/rate-limit.policies.ts` as `RATE_LIMIT_POLICIES`:

| Policy file        | Exported const                | Keys (examples)                                                        |
| ------------------ | ----------------------------- | ---------------------------------------------------------------------- |
| `global.policy.ts` | `GLOBAL_RATE_LIMIT_POLICIES`   | `global` (100/min per user-or-IP)                                       |
| `auth.policy.ts`   | `AUTH_RATE_LIMIT_POLICIES`     | `login`, `loginAccount`, `register`, `registerAccount`, `passwordReset`, `passwordResetAccount`, `emailVerification`, `emailVerificationAccount`, `otpVerify` |
| `passkey.policy.ts`| `PASSKEY_RATE_LIMIT_POLICIES`  | `auth`, `register`                                                      |
| `upload.policy.ts` | `UPLOAD_RATE_LIMIT_POLICIES`   | `fileUpload` (10/min)                                                   |

Each policy is `{ limit, windowSeconds, keyPrefix, extractors, message }` where
`extractors` come from `RateLimitExtractors` (`userOrIp()`, `ip()`,
`emailFromBody("email")`) and decide how the counter key is built.

`RATE_LIMIT_POLICIES` merges them as
`{ global, ...auth, passkeyAuth, passkeyRegister, ...upload }`. Prefer importing
`RATE_LIMIT_POLICIES` and using an existing key over declaring a new ad-hoc policy;
add to the relevant `*.policy.ts` file if none fits.

Use `@SkipRateLimit()` sparingly — only on genuinely public read endpoints, as
`@Get("organizations")` does.

## Config

`src/config/env.validation.ts` is a Zod schema (`envSchema`) covering every
required variable; `configModule` (`src/config/config.module.ts`) is global,
cached, and validates with it. **Adding an env var means adding it here** or
startup fails. Read values with `configService.getOrThrow<string>("NAME")`.

Variables in use: `NODE_ENV`, `PORT`, `DATABASE_*`, `REDIS_*`, `RESEND_API_KEY`,
`JWT_SECRET` / `JWT_EXPIRES_IN`, `APP_URL`, `COOKIE_DOMAIN`,
`ORGANIZATION_MEMBERSHIP_CACHE_TTL_MS`, `R2_*`, `GITHUB_TOKEN`,
`GOOGLE_*` (optional OAuth), `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`.

## Infrastructure

| Concern          | Location                                                  |
| ---------------- | --------------------------------------------------------- |
| Redis client     | `src/infrastructure/redis/redis.module.ts` (`@Global`, `REDIS_CLIENT` token) |
| Cache            | `src/infrastructure/redis/cache.module.ts` (Keyv + KeyvRedis, global `CACHE_MANAGER`) |
| Mail             | `src/infrastructure/mail/{mail.module.ts, mail.service.ts, resend.provider.ts}` |
| Object storage   | `src/infrastructure/storage/r2/` (AWS S3 SDK against Cloudflare R2) |
| Rate limiting    | `src/infrastructure/rate-limit/` with its own `index.ts` barrel |
| Observability    | `@nestjs/observe` wired in `app.module.ts` (`ObserveInstrument`) |

`MailService.sendTemplate({ to, templateId, variables })` delegates to Resend's
template API. Template **bodies** live in `packages/email`; the backend only
supplies template ids and variables. Domain events are emitted from the backend
and handled there — see the `orgatick-email-templates` skill for the pipeline.

## Testing

There are currently **no** test files and no Jest/Vitest config in the backend.
`@nestjs/testing` is installed. Do not assume a test command exists; if you add
tests, add the runner config explicitly and note it in your report.

## Path alias

`tsconfig.json` maps `@/* → ./src/*`. Cross-module imports use `@/common/...`
(e.g. `@/common/authorization`, `@/common/types/auth-request.types`). Relative
imports are used within a module.

`module: nodenext`, `experimentalDecorators` and `emitDecoratorMetadata` are on,
`noImplicitAny: false`, `strictNullChecks: true`. Biome needs
`javascript.parser.unsafeParameterDecoratorsEnabled: true` (set at the root) for
the parameter decorators above.