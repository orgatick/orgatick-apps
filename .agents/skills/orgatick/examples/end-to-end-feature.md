# End-to-end feature template

A worked example of adding a feature that touches all layers. Adapt the shapes,
keep the order. Read the reference file for each layer first.

Scenario: **organization event coupons** — an organizer creates coupons for an
event; participants see them at registration.

## 0. Decide ownership before writing

```text
coupon rules + persistence + endpoints   → apps/backend/src/modules/organization/organization-coupon/
request/response shapes                  → packages/contract/src/organization/organization-coupon/
organizer UI (create/manage)             → apps/organizer/app/(dashboard)/organizations/[id]/coupons/
participant UI (apply at registration)   → apps/client/app/events/[id]/register/
shared button/table/dialog               → packages/ui (only if genuinely missing)
coupon email                             → packages/email/emails/organization/
```

Not needed: no new package, no new top-level folder, no `common/` addition.

## 1. Contracts first

`packages/contract/src/organization/organization-coupon/`

```text
├── index.ts
├── enums/coupon-type.enum.ts
├── queries/query-coupon.dto.ts
├── dtos/create-coupon.dto.ts
└── responses/coupon.response.ts
```

```ts
// enums/coupon-type.enum.ts
export enum CouponType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

export const COUPON_CATEGORIES = ["ticket", "session", "merchandise"] as const;
export type CouponCategory = (typeof COUPON_CATEGORIES)[number];
```

```ts
// queries/query-coupon.dto.ts
import { z } from "zod";

export const QueryCouponSchema = z.object({
  eventId: z.coerce.bigint("Invalid event ID").optional(),
  isActive: z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, "Limit cannot exceed 100").optional().default(20),
});
export const QueryCouponDtoSchema = QueryCouponSchema;
export type QueryCouponDto = z.infer<typeof QueryCouponSchema>;
export type QueryCouponInput = z.input<typeof QueryCouponSchema>;
```

```ts
// dtos/create-coupon.dto.ts
import { z } from "zod";
import { COUPON_CATEGORIES, CouponType } from "../enums/coupon-type.enum";

export const CreateCouponSchema = z.object({
  eventId: z.coerce.bigint("Invalid event ID"),
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(32)
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric with hyphens"),
  type: z.enum(Object.values(CouponType), { message: "Invalid coupon type" }),
  category: z.enum(COUPON_CATEGORIES, { message: "Invalid coupon category" }),
  value: z.coerce.number().positive("Value must be greater than zero"),
  maxRedemptions: z.coerce.number().int().positive().nullable().optional(),
  validFrom: z.coerce.date("Invalid start date"),
  validUntil: z.coerce.date("Invalid end date"),
});
export const CreateCouponDtoSchema = CreateCouponSchema;
export type CreateCouponDto = z.infer<typeof CreateCouponSchema>;
export type CreateCouponInput = z.input<typeof CreateCouponSchema>;
```

Cross-field rules go in a `.refine`, not in a service-only branch — the frontend
gets the same check for free:

```ts
export const CreateCouponSchema = z.object({ /* ... */ }).refine(
  (d) => d.validUntil > d.validFrom,
  { message: "End date must be after the start date", path: ["validUntil"] },
);
```

```ts
// responses/coupon.response.ts
import { z } from "zod";
import { createPaginatedResultSchema } from "../../../address/responses/paginated-result";
import { CouponType } from "../enums/coupon-type.enum";

export const CouponResponseSchema = z.object({
  id: z.bigint("Invalid coupon ID"),
  uuid: z.string("Invalid coupon UUID"),
  eventId: z.bigint("Invalid event ID"),
  code: z.string(),
  type: z.enum(Object.values(CouponType)),
  category: z.string(),
  value: z.coerce.number(),
  redeemedCount: z.coerce.number().int().nonnegative(),
  maxRedemptions: z.coerce.number().int().nullable().optional(),
  isActive: z.boolean(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CouponResponse = z.infer<typeof CouponResponseSchema>;

export const PaginatedCouponResultSchema = createPaginatedResultSchema(CouponResponseSchema);
export type PaginatedCouponResult = z.infer<typeof PaginatedCouponResultSchema>;
```

Wire up barrels: the feature `index.ts`, then
`packages/contract/src/organization/index.ts`.

**Rebuild now** — everything downstream reads `dist/`:

```sh
pnpm turbo build --filter=@orgatick/contracts
```

## 2. Backend

`apps/backend/src/modules/organization/organization-coupon/`

```text
├── organization-coupon.module.ts
├── controllers/coupon.controller.ts
├── entities/coupons.entity.ts
├── repositories/coupons.repository.ts
├── services/coupon.service.ts
└── enums/
```

Reuse the entity and enums if a coupon concept already exists elsewhere — check
`src/common/authorization/permissions/coupon.permissions.ts`, which already
declares `COUPON_PERMISSIONS`.

### Entity

```ts
@Entity("coupons", { schema: "event" })
@Index("IDX_coupons_event_id", ["eventId"])
@Index("IDX_coupons_code_unique", ["code"], { unique: true })
export class Coupon {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ name: "event_id", type: "bigint" })
  eventId!: bigint;

  @Column({ type: "varchar", length: 32, unique: true })
  code!: string;

  @Column({ name: "discount_type", type: "varchar", length: 20 })
  type!: CouponType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value!: number;

  @Column({ name: "max_redemptions", type: "integer", nullable: true })
  maxRedemptions?: number | null;

  @Column({ name: "redeemed_count", type: "integer", default: 0 })
  redeemedCount!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "valid_from", type: "timestamp" })
  validFrom!: Date;

  @Column({ name: "valid_until", type: "timestamp" })
  validUntil!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
```

### Migration

`src/database/migrations/<timestamp>-CreateCoupons.ts`, written by hand with
`queryRunner.createTable(new Table({...}))` and a matching `down()`. Add an index
for anything you filter by.

### Repository

```ts
@Injectable()
export class CouponsRepository {
  constructor(@InjectRepository(Coupon) private readonly repo: Repository<Coupon>) {}

  async findPaginated(options: CouponFindOptions): Promise<[Coupon[], number]> {
    const qb = this.repo.createQueryBuilder("coupon");
    if (options.eventId !== undefined) qb.andWhere("coupon.event_id = :eventId", { eventId: options.eventId });
    if (options.isActive !== undefined) qb.andWhere("coupon.is_active = :isActive", { isActive: options.isActive });
    if (options.search) qb.andWhere("coupon.code ILIKE :search", { search: `%${options.search}%` });
    qb.orderBy("coupon.created_at", "DESC").skip(options.skip).take(options.take);
    return await qb.getManyAndCount();
  }
}
```

Put `CouponFindOptions` (`skip`/`take` + filters) in
`packages/contract/src/organization/organization-coupon/options/`, rebuild contracts.

### Service

```ts
@Injectable()
export class CouponService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async findAll(query: QueryCouponDto): Promise<PaginatedCouponResult> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const [coupons, total] = await this.couponsRepository.findPaginated({
      skip: (page - 1) * limit, take: limit, eventId: query.eventId,
      isActive: query.isActive, search: query.search,
    });
    return { items: coupons.map((c) => this.mapToResponse(c)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Business rules live here, not in the controller or the frontend. */
  async create(userId: bigint, eventId: bigint, dto: CreateCouponDto): Promise<CouponResponse> {
    const existing = await this.couponsRepository.findByCode(dto.code);
    if (existing) throw new ConflictException(`Coupon code '${dto.code}' already exists`);

    await this.couponsRepository.save(
      this.couponsRepository.create({ ...dto, value: Number(dto.value), eventId }),
    );
    return await this.findByCode(dto.code);
  }

  private mapToResponse(c: Coupon): CouponResponse {
    return { id: c.id, uuid: c.uuid, /* explicit fields */ };
  }
}
```

For multi-step writes use `typeorm-transactional`'s `@Transactional()`; the
context is initialized in `main.ts` and `data-source.ts`.

### Controller

```ts
@Controller("events/:eventId/coupons")
@UseGuards(OrganizationContextGuard)   // org scoping — see the organization-context skill
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  async findAll(
    @CurrentOrganization() org: OrganizationContext,
    @Param("eventId") eventId: string,
    @Query({ schema: QueryCouponSchema }) query: QueryCouponDto,
  ): Promise<PaginatedCouponResult> {
    return await this.couponService.findAll({ ...query, eventId: BigInt(eventId) });
  }

  @Post()
  @RateLimit(RATE_LIMIT_POLICIES.register)   // name an existing policy from constants/policies/
  async create(
    @CurrentOrganization() org: OrganizationContext,
    @Param("eventId") eventId: string,
    @Body({ schema: CreateCouponSchema }) dto: CreateCouponDto,
  ): Promise<CouponResponse> {
    return await this.couponService.create(org.organizationId, BigInt(eventId), dto);
  }
}
```

Authorization: verify the user actually owns/administers the event **in the
service**. `@RequirePermission` alone does nothing today (see
`known-gaps-and-traps.md`).

Return the plain object — `TransformInterceptor` wraps it. Don't wrap manually.

### Register the module

Add `OrganizationCouponModule` to
`src/modules/organization/organization.module.ts` imports **and** exports.

## 3. Organizer UI

`apps/organizer/app/(dashboard)/organizations/[id]/coupons/`

```text
page.tsx                  server component: fetch list, render panel
_components/coupons-panel.tsx
_components/coupon-form.tsx
_services/coupon.service.ts
```

```tsx
// page.tsx
import type { Metadata } from "next";
import { getOrganizationOr404 } from "@/lib/server-org";
import serverApi from "@/lib/apis/server-auth-api";
import type { PaginatedCouponResult } from "@orgatick/contracts";
import { CouponsPanel } from "./_components/coupons-panel";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getOrganizationOr404(id);
  const api = await serverApi();
  const response = await api.get(`/events/${id}/coupons`, { params: { limit: 20 } });
  const result: PaginatedCouponResult = response.data.data;
  return <CouponsPanel coupons={result.items} total={result.total} />;
}
```

Note the double unwrap: `response.data.data`.

```ts
// _services/coupon.service.ts
import api from "@/lib/apis/auth.api";
import { getApiErrorMessage } from "@/lib/apis/api-error";
import type { CreateCouponInput, CouponResponse } from "@orgatick/contracts";

export const couponService = {
  async create(eventId: string, payload: CreateCouponInput): Promise<CouponResponse> {
    try {
      const res = await api.post(`/events/${eventId}/coupons`, payload);
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not create the coupon."));
    }
  },
};
```

```tsx
// _components/coupon-form.tsx  (client component)
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@orgatick/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { toast } from "@/components/ui/sonner";
import { CreateCouponSchema, type CreateCouponDto } from "@orgatick/contracts";
import { couponService } from "../_services/coupon.service";

export function CouponForm({ eventId }: { eventId: string }) {
  const form = useForm<CreateCouponDto>({ resolver: zodResolver(CreateCouponSchema) });

  async function onSubmit(values: CreateCouponDto) {
    try {
      await couponService.create(eventId, values);
      toast.success("Coupon created");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the coupon.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller name="code" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Code</FieldLabel>
              <Input {...field} placeholder="EARLYBIRD" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>Create coupon</Button>
      </FieldGroup>
    </form>
  );
}
```

Use tokens (`bg-primary`, `text-muted-foreground`), never hex. Icons from
`@tabler/icons-react`. Do not copy a shared component locally — add it to
`packages/ui` if it's missing.

## 4. Participant UI

`apps/client/app/events/[id]/register/` — same pattern, client audience. The
participant path is likely `@Public()` on the read side and must validate
redemption limits, window, and event ownership **on the backend**. A coupon
applied in the browser is untrusted.

## 5. Email

Only if a coupon event warrants one. Add
`packages/email/emails/organization/coupon-created.tsx` following the template
contract (optional props, `{{{placeholder}}}` defaults, `PreviewProps`, wrapped in
`EmailLayout` with `EmailHeader`/`EmailFooter`). The backend sends it by Resend
template id through `MailService.sendTemplate`. Keep the trigger in the backend.

## 6. Validate

```sh
pnpm turbo build --filter=@orgatick/contracts     # after every contracts change
pnpm turbo check-types --filter=@orgatick/backend
pnpm turbo lint --filter=@orgatick/backend
pnpm turbo check-types --filter=organizer
pnpm turbo check-types --filter=client
pnpm check-types
pnpm lint
```

For a migration-bearing backend change:

```sh
pnpm --filter @orgatick/backend build     # data-source reads dist/
pnpm --filter @orgatick/backend migration:run
```

## 7. Report

State: what changed and where, why it lives there, which contracts were added and
whether they need a rebuild, the validation commands you actually ran and their
result, and known concerns (e.g. `PermissionGuard` is a stub; there are no tests in
this area so typecheck/lint is the only signal).