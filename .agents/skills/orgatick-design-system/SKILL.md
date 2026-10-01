---
name: orgatick-design-system
description: >
  Frontend design and UI conventions for Orgatick. Use when creating, restyling,
  or reviewing any UI in apps/client, apps/organizer, apps/admin, or
  packages/ui. Covers the design tokens in packages/ui/src/styles/globals.css,
  typography (Source Sans 3 + Source Code Pro), the radius and type ramps,
  spacing and layout widths, the strict badge/status rule, the motion budget,
  iconography (Tabler), card and form composition, and the component inventory.
  Triggers on: component, page, layout, styling, restyle, tailwind classes,
  className, design system, badge, button, card, form, field, input, table,
  dialog, modal, drawer, toast, spinner, skeleton, empty state, color, spacing,
  padding, margin, radius, rounded, shadow, font, typography, animation,
  transition, hover, dark mode, theme, icon, shadcn component. Do NOT use for
  backend, API, controller, service, database, Zod contract, or email-template
  work with no UI component involved.
license: MIT
metadata:
  author: Orgatick Team
  version: "1.0.0"
  tags: orgatick, ui, design-system, tailwind, shadcn, base-ui, tabler, frontend
---

# Orgatick Design System

UI conventions for `apps/client`, `apps/organizer`, `apps/admin`, and
`packages/ui`.

**The source code is authoritative.** If this skill and the code disagree, trust
the code and correct the skill. Full reference:
[`docs/design-system.md`](../../../docs/design-system.md).

Load `.agents/skills/shadcn` alongside this one for generic shadcn patterns.
Where the two conflict, this skill wins — the divergences are listed below.

## Non-negotiables

1. **Semantic tokens only.** Colors come from `packages/ui/src/styles/globals.css`
   via Tailwind utilities: `bg-background`, `text-foreground`, `text-primary`,
   `bg-muted`, `text-muted-foreground`, `border-border`, `ring-ring`,
   `text-destructive`, plus `success` / `warning` / `info`. No raw palette
   utilities for meaning (`text-emerald-600`, `text-indigo-500`) and no
   hardcoded hex in components. Add a token in both `:root` and `.dark` instead.
2. **Base UI, not Radix.** Composition is `render={<X />}`, never `asChild`.
3. **Tabler icons only** (`@tabler/icons-react`). Never a second icon family.
4. **Badges are for state, nothing else.** See the rule below.
5. **No looping ambient animation.** Infinite loops are for loaders, auth-pending
   screens, and `not-found` only.
6. **Prefer `transition-colors` over `transition-all`.** Durations `200`/`300`.
7. **No raw hex, no new scales.** The radius, spacing, and type ramps below are
   the system.
8. **Respect `prefers-reduced-motion`** for anything that moves.
9. **Never hardcode `#` colors or invent a spacing scale.**

## Badges

Ask: *does this value describe a state that changes over time and that a user
must scan for or act on?*

- ✅ Badge: organization `pending` / `active` / `suspended`, application
  `approved` / `rejected`, payment `succeeded` / `failed`.
- ❌ Not a badge: counts (`12 items`), IDs, category or plan names on a table
  row, section eyebrows, counts next to nav items.

Static metadata is `text-muted-foreground`, or the mono micro-label style when
it is genuinely a small caps label.

A short categorical tag is allowed in a marketing hero or pricing card, but it
must not become the default — never badge every card in a grid or every table
row.

**Never replicate the copy-paste override** used at ~10 admin sites:

```
<Badge className="px-1.5 py-0 font-mono text-[9px] capitalize">
```

It fights the component and mixes mono with `capitalize`. If a compact status
chip is needed, add a `size` to `packages/ui/src/components/badge.tsx` so it is
defined once.

Badges are not interactive — no `hover:`, `cursor-pointer`, or `onClick`.

## Foundations

**Type.** Source Sans 3 (`--font-sans`, and `--font-heading` which is the same
family — there is no display face). Source Code Pro (`--font-mono`) for
micro-labels, codes, IDs, and tabular figures only.

Ramp: `text-[9px]`/`[10px]`/`[11px]` micro → `text-xs` (12) labels → `text-sm`
(14) default body → `text-base` (16) card titles → `text-lg` and up for
headings. Do not add sizes below `text-[9px]`.

Mono micro-label signature — the codebase's most recognizable convention:

```
font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
```

Variants: muted (default), `text-muted-foreground/70` (tertiary), `text-primary`
(active step), `leading-none` (inline indicator).

**Radius.** `--radius: 10px` with multipliers `sm ×0.6`, `md ×0.8`, `lg ×1.0`,
`xl ×1.4`, `2xl ×1.8`, `3xl ×2.2`, `4xl ×2.6`. `rounded-lg` for controls,
`rounded-xl` for cards and floating surfaces, `rounded-full` for pills and
avatars only. Small controls clamp via
`rounded-[min(var(--radius-md),10px)]` — follow that.

**Layout.** Container is `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. Then
`max-w-3xl` prose, `max-w-md` forms. Standard 4px spacing scale; no custom one.

**Elevation.** Cards use `ring-1 ring-foreground/10` on `bg-card`, never a
shadow. Shadows are only for genuinely floating layers: popover, dropdown,
dialog, sheet, drawer, toast. The marketing navbar's scroll-linked
`navbar-surface` effect is the one sanctioned scroll animation.

**Icons.** Tabler. Sizes track the control: `size-3` in `xs` buttons, `size-3.5`
in `sm`, `size-4` by default. Buttons auto-size child SVGs, so usually do not
set it.

## Composition

**Cards** are slot-based — use the slots, do not override padding:
`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
`CardContent`, `CardFooter`. `CardHeader` becomes a two-column grid when a
`card-action` is present. Interior spacing is `--card-spacing`
(`--spacing(4)`, or `(3)` at `size="sm"`).

**Dense console rows** are flat, not cards:

```
rounded-lg px-2 py-2 transition-colors hover:bg-muted/60
```

**Forms** use the `Field*` family: `FieldSet`, `FieldLegend`, `FieldGroup`,
`Field`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`,
`FieldSeparator`, `FieldError`. Validation messages go in `FieldError`. Space
fields with `FieldGroup`, not `space-y-*`.

**Toasts** are Sonner via the app-local wrapper — import from
`@/components/ui/sonner`. **There is no `toast` component**;
`@/components/ui/toast` does not exist. It maps onto `--popover`,
`--popover-foreground`, `--border`, and `--radius`.

**Empty / loading / error.** `Empty` for no-data, `Skeleton` for
content-shaped placeholders, `Spinner` for short waits, `FieldError` for
validation, `toast` for transient confirmations.

## Motion budget

- `transition-colors` over `transition-all`; `duration-200` / `duration-300`.
- `motion/react-client` for genuine state orchestration (steppers, form action
  bars, submission overlays) — not decoration.
- Infinite loops: loaders, auth-pending, `not-found`. Nothing else.
- No pulsing orbs, floating blobs, drifting gradients, parallax, or
  auto-advancing carousels.
- `animate-pulse` is a loading affordance, never a decorative icon.
- One-shot entrances (`animate-in fade-in slide-in-from-bottom-4
  duration-500`) are fine once per section, not stacked.

## Anti-patterns

Do not add: ambient glows or floating blobs; gradient text on headings;
`animate-pulse` beside a headline; badges for counts, IDs, or categories;
`transition-all` as a blanket; raw palette colors for meaning; mixed icon
families; copy-pasted class strings instead of a `cva` variant; hardcoded hex;
stacked entrance animations; invented scales.

Several of these exist in the current marketing pages. That is existing debt,
not the standard.

Test: **if removing it would lose no information, it should not be there.**

## Component inventory

`packages/ui/src/components/` has 49 components: `accordion`, `alert`,
`alert-dialog`, `aspect-ratio`, `attachment`, `autocomplete`, `avatar`, `badge`,
`breadcrumb`, `button`, `button-group`, `card`, `carousel`, `chart`, `checkbox`,
`collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`,
`empty`, `field`, `glow`, `hover-card`, `input`, `input-group`, `input-otp`,
`item`, `label`, `mockup`, `pagination`, `password-input`, `phone-input`,
`popover`, `progress`, `resizable`, `scroll-area`, `select`, `separator`,
`sheet`, `sidebar`, `skeleton`, `spinner`, `switch`, `table`, `tabs`,
`textarea`, `tooltip`.

Not installed: `calendar`, `form`, `menubar`, `navigation-menu`,
`radio-group`, `slider`, `toggle`, `toggle-group`, `toast`. Toasts are Sonner
and app-local.

`glow` and `mockup` are marketing-only — keep them out of the consoles.

**Check this list before importing.** The generic shadcn skill describes
components that may not exist here.

## Adding new UI

1. Already in `packages/ui`? Use it.
2. Needs a different look? Extend the `cva` variant map in
   `packages/ui/src/components/<name>.tsx`. Never pass ad-hoc class strings.
3. Genuinely new primitive? Add to `packages/ui`: Base UI, Tabler, a
   `data-slot` per compound part, tokens only, wrapped in `cn(...)`.
4. App-specific composition? Keep it in that app's `components/`.

Do not run `shadcn add` from an app directory expecting a shared component —
the app `components.json` aliases `ui` to `@/components`, so it writes an
app-local copy and fragments the library. Add shared primitives to
`packages/ui` directly. Do not edit the `components.json` files.

## Validation

```bash
pnpm check && pnpm check-types
```

Biome does not lint Markdown, so docs and skills are not checked — keep them
accurate anyway, and update them in the same change as the convention they
describe.
