# Orgatick Design System

Frontend conventions for `apps/client`, `apps/organizer`, `apps/admin`, and
`packages/ui`. Written from the code as it exists today, not from an external
style guide.

**The source code is authoritative.** If this document and the code disagree,
trust the code and fix this document.

## How to use this document

- This is the human reference.
- `.agents/skills/orgatick-design-system/SKILL.md` is the agent-facing summary
  with the non-negotiable rules.
- `.agents/skills/shadcn/SKILL.md` is the **generic** upstream shadcn skill. It
  describes the full shadcn component set. Orgatick diverges from it in ways
  that matter, listed in [Traps](#9-traps). Where the two conflict, this
  document wins.

### Where UI code lives

| Path | Owns |
| --- | --- |
| `packages/ui/src/components/` | Shared primitives. Source-only, no build step. |
| `packages/ui/src/styles/globals.css` | The single source of design tokens. |
| `apps/*/components/` | App-specific composition and app-local wrappers. |
| `apps/*/app/**` | Routes, layouts, page composition. |

Apps consume shared primitives through the `@orgatick/ui/components/*` subpath
import. `packages/*` never imports from `apps/*`.

---

## 1. Product surfaces

Orgatick has four distinct surfaces with different density and motion budgets.
A pattern that is right on the marketing site is usually wrong in a console.

| Surface | Location | Density | Motion budget |
| --- | --- | --- | --- |
| Marketing | `apps/client/app/(marketing)`, `apps/client/components/sections/` | Spacious, `max-w-7xl` | One-shot entrances only |
| Participant | `apps/client/app/(account)`, `(auth)`, `events` | Standard | Minimal |
| Operator console | `apps/organizer` | Dense | Minimal |
| Platform console | `apps/admin/app/(dashboard)` | Densest | Minimal |

Rule: **a marketing pattern must be re-justified before it appears in a
console.** Consoles optimize for scanning and completing tasks, not for
impression.

---

## 2. Foundations

### 2.1 Color

All tokens live in `packages/ui/src/styles/globals.css`. Dark mode is
class-based through `next-themes` (`.dark` variant, declared with
`@custom-variant dark (&:is(.dark *))`).

| Token | Light | Dark | Use for |
| --- | --- | --- | --- |
| `--background` | `#f4f7fc` | `#090f1a` | Page base |
| `--foreground` | `#1a2b4c` | `#eaf2ff` | Primary text |
| `--card` / `--popover` | `#ffffff` | `#0d141f` | Raised surfaces |
| `--primary` | `#204b90` | `#5d8ff4` | Primary actions, links, active nav |
| `--secondary` | `#6355a4` | `#8a7af2` | Secondary emphasis |
| `--accent` | `#5d82d9` | `#3d5fb2` | Accent surfaces |
| `--muted` | `#e7ecf3` | `#1b2433` | Subtle fills, hover rows |
| `--muted-foreground` | `#6c7480` | `#b6c1d6` | Secondary text |
| `--border` | `#c6ccd5` | `#2c364a` | Dividers, outlines |
| `--input` | `#d8dde6` | `#37435a` | Form control borders |
| `--ring` | `#2a56a5` | `#4d76d1` | Focus rings |
| `--success` | `#2ecc71` | `#3ad578` | Success state |
| `--warning` | `#f1c40f` | `#f4c542` | Warning state |
| `--info` | `#3498db` | `#58a6ff` | Informational state |
| `--destructive` | `#d9534f` | `#ff6b6b` | Errors, destructive actions |

Sidebar and chart token sets are also defined; see the file.

**Rules**

- Use semantic tokens only for meaning. `text-primary`, not `text-blue-700`.
- Do not introduce raw palette utilities (`emerald-600`, `indigo-500`,
  `purple-600`) for semantic purposes. They appear in current marketing code;
  treat that as decoration, not a system color.
- Never hardcode a hex value in a component. If a needed color is missing, add
  a token in both `:root` and `.dark`.
- `text-emerald-*` currently appears ~93 times for ad-hoc success text. Prefer
  adding a `success` foreground token over extending that pattern.

### 2.2 Typography

Two families, both self-hosted via `next/font/google`:

| Role | Font | Variable | Tailwind |
| --- | --- | --- | --- |
| Sans / heading | Source Sans 3 | `--font-sans` | `font-sans`, `font-heading` |
| Mono | Source Code Pro | `--font-source-code-pro` | `font-mono` |

`--font-heading` intentionally maps to the same family as `--font-sans`; there
is no separate display face.

Each app root layout imports both and applies `.variable` on `<html>`. Adding a
font to one app means adding it to all three — the token contract lives in
`packages/ui`.

```tsx
// apps/*/app/layout.tsx
import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";

const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: "--font-source-code-pro" });

<html className={cn("antialiased", "font-sans", sourceSans3.variable, sourceCodePro.variable)}>
```

#### Type ramp

Observed frequencies across `apps/*/app`, `apps/*/components`, and
`packages/ui/src`:

| Step | Class | Approx. uses | Role |
| --- | --- | --- | --- |
| Micro | `text-[9px]`, `text-[10px]`, `text-[11px]` | 59 + 41 | Mono micro-labels, dense metadata |
| Small | `text-xs` (12px) | 410 | Labels, table cells, help text |
| Body-sm | `text-sm` (14px) | 307 | Default body inside components |
| Base | `text-base` (16px) | 101 | Card titles, page intros |
| Large | `text-lg` (18px) | 49 | Section subheads |
| Display | `text-xl` → `text-4xl`+ | 36 / 36 / 41 / 28 | Marketing and page headings |

`Card` sets `text-sm` as its base; `CardTitle` overrides to `text-base`.

#### The mono micro-label signature

This is the most distinctive convention in the codebase: small, uppercase,
widely-tracked, muted sans-adjacent labels rendered in Source Code Pro.

**Canonical form** (section eyebrows, step labels, sidebar group headers):

```
font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
```

Variants in use:

| Variant | Class string | Use |
| --- | --- | --- |
| Muted | `font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground` | Default eyebrow / group label |
| Faded | same with `text-muted-foreground/70` | Tertiary grouping, inactive |
| Primary | `font-mono text-[10px] font-semibold uppercase tracking-widest text-primary` | Current step, active group |
| Plain | `font-mono text-[10px] font-semibold leading-none text-primary` | Inline numeric / step indicator |

Rules:

- Mono is for micro-labels, codes, IDs, keyboard hints, and tabular figures.
  Never set body copy or long strings in mono.
- Do not introduce new arbitrary sizes below `text-[9px]`.
- Do not mix a mono label with `capitalize` — see the badge anti-pattern in
  [§3.4](#34-status-and-badges).

### 2.3 Radius

One base value, multiplied into a scale. `--radius: 10px`.

| Token | Formula | Computed | Use |
| --- | --- | --- | --- |
| `--radius-sm` | `× 0.6` | 6px | Dense internals, badges |
| `--radius-md` | `× 0.8` | 8px | Inputs, small controls |
| `--radius-lg` | `× 1.0` | 10px | Buttons, list rows — the default |
| `--radius-xl` | `× 1.4` | 14px | Cards, popovers, panels |
| `--radius-2xl` | `× 1.8` | 18px | Large feature containers |
| `--radius-3xl` | `× 2.2` | 22px | Rare |
| `--radius-4xl` | `× 2.6` | 26px | Rare |

Observed usage: `rounded-full` 159, `rounded-xl` 138, `rounded-lg` 119,
`rounded-2xl` 71, `rounded-md` 48.

- `rounded-lg` is the default for interactive controls.
- `rounded-xl` is the default for cards and floating surfaces.
- `rounded-full` is for pills and avatars only.
- Button `xs`/`sm` sizes clamp to a max radius via
  `rounded-[min(var(--radius-md),10px)]` so small controls do not look bulbous.
  Follow that pattern for new small controls.

### 2.4 Spacing and layout

Standard Tailwind 4px scale. No custom spacing scale exists — do not invent one.

**Container.** Marketing and wide content:

```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

| Width | Use |
| --- | --- |
| `max-w-7xl` | Default page container (27 uses) |
| `max-w-6xl` / `max-w-4xl` | Wide marketing sections |
| `max-w-3xl` | Prose and long-form reading (19 uses) |
| `max-w-2xl` | Sub-headlines, focused content |
| `max-w-md` | Forms, narrow panels (18 uses) |
| `max-w-sm` | Small widgets |

**Gap vs space-y.** Shared components in `packages/ui` use `gap-*` and a
`--card-spacing` custom property. Page-level markup in the consoles still uses
`space-y-*` in places; that is acceptable at the page level. Do not introduce
`space-y-*` inside `packages/ui` components — it fights parent gaps and the
`--card-spacing` model.

`Card` exposes the pattern: `gap-(--card-spacing)` with
`[--card-spacing:--spacing(4)]`, and `--spacing(3)` when `size="sm"`.

### 2.5 Elevation

Elevation is deliberately minimal.

- `--shadow-sm: 0 4px 6px rgba(0,0,0,0.08)` and
  `--shadow: 0 6px 10px rgba(0,0,0,0.1)` are the only shadow tokens.
- **Cards do not use shadows.** `Card` uses
  `ring-1 ring-foreground/10` on a `bg-card` fill. Borders and rings separate
  surfaces; shadows are reserved for genuinely floating layers —
  popovers, dropdowns, dialogs, sheets, drawers, and toasts.
- The marketing navbar has a scroll-driven `navbar-surface` keyframe animation
  that adds a border and shadow as the user scrolls (`.navbar-scroll`, guarded by
  `@supports (animation-timeline: scroll())`). This is the one place a
  scroll-linked effect is appropriate.

### 2.6 Motion

Motion is a budget, not a default. Over-animating is a known failure mode in
this codebase's marketing pages.

**Tailwind transitions**

- Prefer `transition-colors` (107 uses). It is the workhorse.
- `transition-all` (60 uses) is discouraged — it animates layout properties and
  causes unintended motion. Use a targeted `transition-[<property>]` when a
  non-color property must animate.
- Standard durations: `duration-200`, `duration-300`. Avoid longer except for
  deliberate one-shot entrances.

**`motion/react-client`**

Used for real state orchestration, not decoration. Legitimate current uses:

- `apps/organizer/app/(organizations)/create/_components/application-stepper.tsx`
  — step transitions
- `.../form-action-bar.tsx` — bar entrance/exit
- `.../submission-overlay.tsx` — submission state
- Marketing section entrances and the auth/verify state screens

**Infinite loops are for waiting states only.** `repeat: Infinity` appears 14
times across 5 files, all of them legitimate: loaders, auth-pending screens,
and `not-found.tsx`.

**Rules**

- No looping ambient animation on decorative elements — no pulsing orbs, no
  floating blobs, no endlessly drifting gradients.
- `animate-spin` is for loaders only (including Sonner's loading icon).
- `animate-pulse` is for skeleton/loading affordances only, never a decorative
  icon next to a headline.
- One-shot entrance animations (`animate-in fade-in slide-in-from-bottom-4
  duration-500`) are acceptable once per section, not stacked.
- New `motion` usage should set `useReducedMotion` or otherwise respect
  `prefers-reduced-motion`. `globals.css` already zeroes theme transitions
  under a reduced-motion media query; extend the same treatment.
- No parallax, no scroll-jacking, no auto-advancing carousels.

### 2.7 Iconography

**Tabler only** — `@tabler/icons-react`. This is set in all four
`components.json` files via `"iconLibrary": "tabler"`.

Do not introduce Lucide, Heroicons, or any second icon set. Mixed icon
families are the fastest way to make a UI look generated rather than designed.

Sizes follow the control they sit in:

| Context | Size |
| --- | --- |
| Button `xs` / `icon-xs` | `size-3` |
| Button `sm` / `icon-sm` | `size-3.5` |
| Button default and up | `size-4` |
| Standalone emphasis | `size-5` |

Buttons normalize child icons automatically:
`[&_svg:not([class*='size-'])]:size-4`. You rarely need to size an icon inside a
button. `Icon` and SVG children are `shrink-0`.

### 2.8 Backgrounds and grid

`bg-grid-pattern` in `globals.css` renders a 44px grid at 12% foreground
opacity. It is a marketing-surface texture.

`hero.tsx` currently redefines the grid inline at 32px with a radial mask
instead of using the token. Prefer the token; do not add further one-off grid
overlays.

---

## 3. Composition

### 3.1 Page shells

- **Marketing** — sticky/translucent navbar (`navbar-scroll` for the
  scroll-linked surface), then `<section>` elements each owning their own
  `max-w-7xl` container.
- **Consoles** — a fixed sidebar (`apps/admin/components/sidebar/`,
  `apps/organizer/components/sidebar/`) plus a content column. The sidebar group
  labels use the mono micro-label variant.
- **Participant** — the `(account)` route group with its own layout.

Root layouts set `<body>` height via `h-dvh` / `min-h-full` and apply
`antialiased` and `font-sans` on `<html>`.

### 3.2 Card anatomy

`Card` is a slot-based compound component. Use the slots rather than overriding
padding.

| Slot | Purpose |
| --- | --- |
| `Card` | Container. `rounded-xl`, `bg-card`, `ring-1 ring-foreground/10` |
| `CardHeader` | Grid, `auto-rows-min`; becomes `1fr auto` when a `card-action` is present |
| `CardTitle` | `font-heading text-base font-medium` |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardAction` | Trailing control slot; drives the header's column split |
| `CardContent` | `px-(--card-spacing)` |
| `CardFooter` | Collapses the container's bottom padding |

`CardHeader` auto-inserts a row when a `card-description` is present, and grows
bottom padding when it carries a `border-b`.

Console pattern — a titled card with a trailing control:

```tsx
<Card>
  <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
    <CardTitle>Organizations</CardTitle>
    <Button size="sm" variant="outline">New</Button>
  </CardHeader>
  <CardContent className="space-y-1">…</CardContent>
</Card>
```

### 3.3 Dense data rows

The console list-row idiom, used in the admin and organizer dashboards:

```
rounded-lg px-2 py-2 transition-colors hover:bg-muted/60
```

Rows are flat, hover-tinted, and separated by a parent `gap`/`space-y-1`. They
are not cards and carry no individual border or shadow. When a row is
navigable, make the whole row the link target rather than nesting an anchor
around part of it.

### 3.4 Status and badges

**Badges are for state. Nothing else.** This is the strictest rule in the
document.

Ask: *does this value describe a state that changes over time and that a user
must scan for or act on?*

| | Example | Verdict |
| --- | --- | --- |
| ✅ Badge | organization `pending` / `active` / `suspended` | Genuine status |
| ✅ Badge | application `approved` / `rejected` | Genuine status |
| ✅ Badge | payment `succeeded` / `failed` | Genuine status |
| ❌ Not a badge | `12 items` | Static count |
| ❌ Not a badge | an organization ID | Static identifier |
| ❌ Not a badge | a category or plan name on a table row | Static metadata |
| ❌ Not a badge | a section eyebrow | Use the mono micro-label |
| ❌ Not a badge | a count next to a nav item | Use plain muted text |

For static metadata use `text-muted-foreground`, or the mono micro-label style
when it is genuinely a small caps label.

**The marketing exception.** A short categorical tag in a marketing hero or
pricing card is acceptable, e.g. the tagline badge in `hero.tsx`. Two
constraints: it must be visually distinct from console status badges, and it
must not become the default for anything structural. Never badge every card in
a grid, every column header, or every list row.

**Anti-pattern to stop.** Roughly 10 sites in the admin status lists use:

```
<Badge className="px-1.5 py-0 font-mono text-[9px] capitalize">
```

This is a copy-pasted override that fights the component, mixes mono and
`capitalize`, and produces a cramped, noisy chip. Do not replicate it. If a
compact status chip is genuinely needed, add a proper `size` (and, if the
color mapping is systematic, a variant) to
`packages/ui/src/components/badge.tsx` so it is defined once.

**Other badge rules**

- A badge is not interactive. No `hover:`, no `cursor-pointer`, no `onClick`.
- Do not encode status by color alone — pair the color with text.
- Badge colors should come from `success` / `warning` / `info` /
  `destructive` / `primary` tokens, not ad-hoc palette values.

### 3.5 Forms

Forms are composed from the `Field*` family in
`packages/ui/src/components/field.tsx`:

`FieldSet`, `FieldLegend`, `FieldGroup`, `Field`, `FieldContent`,
`FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldSeparator`,
`FieldError`.

Structure a control like this:

```tsx
<Field>
  <FieldLabel htmlFor="email">Work email</FieldLabel>
  <FieldDescription>We'll only use this for your receipts.</FieldDescription>
  <Input id="email" type="email" />
  <FieldError>…</FieldError>
</Field>
```

- Wrap related fields in `FieldSet` with a `FieldLegend` when they form a
  labelled group.
- `FieldGroup` spaces the fields; do not add `space-y-*` inside it.
- Validation messages belong in `FieldError`, not in ad-hoc red text.
- Buttons carry `aria-invalid` styling; mirror the same state on the input.
- Inputs come in `input`, `password-input`, `phone-input`, and
  `input-group` flavors. Pick the matching one instead of bolting behavior on.

### 3.6 Feedback

Toasts use **Sonner** through an app-local wrapper, one per app:

- `apps/client/components/ui/sonner.tsx`
- `apps/organizer/components/ui/sonner.tsx`
- (admin has `link-button.tsx` but no Sonner wrapper — add one following the
  same pattern if admin needs toasts)

Import from `@/components/ui/sonner`:

```tsx
import { Toaster, toast } from "@/components/ui/sonner";
```

The wrapper maps Sonner onto the design tokens: `--popover` background,
`--popover-foreground` text, `--border` border, `--radius` radius. Icons are
Tabler at `size-4`, and the loading icon is `animate-spin`. The
`cn-toast` className is a styling hook for consumers.

**There is no shared `toast` component.** `@/components/ui/toast` does not
exist and importing it will fail. The generic shadcn skill's advice to use Base
UI `toast` does not apply here.

Choose the right channel:

| Situation | Use |
| --- | --- |
| Transient confirmation of a completed action | `toast` |
| Persisted empty collection | `Empty` |
| Field-level validation | `FieldError` |
| Content-shaped placeholder | `Skeleton` |
| Short unknown wait | `Spinner` |

### 3.7 Empty, loading, and error states

- `Empty` for a collection with no items. Every list surface should define one.
- `Skeleton` mirrors the shape of the content that is coming; avoid spinners
  where a skeleton is possible.
- `Spinner` for waits under roughly a second.
- Each app owns `error.tsx` and `not-found.tsx` at the app root. These are the
  right places for the 14 legitimate looping animations.

---

## 4. Anti-patterns

Do not add these. Several exist in the current marketing pages; that is
existing debt, not the standard to follow.

| Anti-pattern | Why it's wrong |
| --- | --- |
| Ambient glowing orbs, floating blobs, drifting gradient blobs | Looping decoration with no information value. Reads as generated. |
| Gradient text on headings (`bg-linear-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text`) | Brand gradient abuse. The primary is a solid brand color. |
| `animate-pulse` on a decorative icon beside a headline | Motion with no state meaning. |
| Badges for counts, IDs, categories, or section eyebrows | Misuses the one component reserved for state. See [§3.4](#34-status-and-badges). |
| A badge in every card of a grid, or on every table row | Noise; destroys scannability. |
| `transition-all` as a blanket | Animates layout; causes unintended motion. |
| Raw palette colors (`emerald-600`, `indigo-500`) for meaning | Breaks light/dark parity and the token contract. |
| Mixing Tabler with another icon family | Instantly reads as assembled rather than designed. |
| Copy-pasted class strings instead of a `cva` variant | The override hack is why the badge situation is messy. |
| Hardcoded hex values in components | Bypasses theming. |
| Stacking multiple entrance animations in one section | Reads as a slideshow. |
| Inventing a new spacing, radius, or type scale | The existing scales are the system. |

The test for any new visual: **if removing it would lose no information, it
should not be there.**

---

## 5. Component inventory

`packages/ui/src/components/` — 49 components, verified:

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `attachment`,
`autocomplete`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`,
`card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`,
`context-menu`, `dialog`, `drawer`, `dropdown-menu`, `empty`, `field`, `glow`,
`hover-card`, `input`, `input-group`, `input-otp`, `item`, `label`, `mockup`,
`pagination`, `password-input`, `phone-input`, `popover`, `progress`,
`resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`,
`skeleton`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`.

**Not present:** `calendar`, `form`, `menubar`, `navigation-menu`,
`radio-group`, `slider`, `toggle`, `toggle-group`, `toast` / `toaster`.

Notes:

- Toasts are Sonner and app-local — see [§3.6](#36-feedback).
- `glow.tsx` and `mockup.tsx` are marketing-only primitives. Keep them out of
  the consoles.
- `packages/address` owns address form controls and the Leaflet map, including
  the extensive Leaflet overrides in `globals.css`. It is shared, not app-local.

**Before importing a component, check this list.** If it is absent, add it to
`packages/ui` rather than dropping a copy into one app.

---

## 6. Adding new UI

Follow this ladder in order:

1. **Does it already exist in `packages/ui`?** Use it as-is.
2. **Does it exist but need a different look?** Extend the `cva` variant map
   in `packages/ui/src/components/<name>.tsx`. Do not pass ad-hoc class strings
   at the call site.
3. **Is it a genuinely new primitive?** Add it to `packages/ui`. Requirements:
   - Base UI primitive, not Radix.
   - Tabler icons only.
   - A `data-slot` attribute on every part of a compound component.
   - Tokens only; no hardcoded colors.
   - A `cn(...)` call so callers can extend safely.
4. **Is it app-specific composition?** Keep it in that app's `components/`.

Shared components belong in `packages/ui`. Because the app-level
`components.json` files alias `ui` to `@/components`, running `shadcn add` from
an app directory writes an app-local copy and fragments the library. Add
shared primitives to `packages/ui` directly, and prefer editing an existing
component over installing a new one.

### Base UI, not Radix

`@base-ui/react` is the primitive layer — 19 components use it, and no component
uses Radix. Composition uses `render`, not `asChild`:

```tsx
// Base UI
<Dialog.Trigger render={<Button variant="outline" />}>Open</Dialog.Trigger>

// Radix — does not apply here
<Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>
```

The `Button` component in `packages/ui` is itself a Base UI primitive and
already accepts `render`.

---

## 7. Accessibility

- Focus rings are part of the component contract. `Button` ships
  `focus-visible:ring-3 focus-visible:ring-ring/50` plus
  `focus-visible:border-ring`. Do not remove them.
- Every interactive element needs a visible focus state. Global `*` sets
  `outline-ring/50` as a baseline.
- Icon-only buttons need an `aria-label`. Prefer the `icon*` button sizes.
- Buttons set `cursor: pointer` globally and disable it when `disabled`.
- Status is never conveyed by color alone — always pair with text.
- `aria-invalid` is wired on `Button`; mirror the attribute on the input so
  assistive tech announces the state.
- Respect `prefers-reduced-motion` for anything that moves.
- Use the `table` component's semantics rather than a grid of `div`s for
  tabular data.
- `*` sets `border-border` globally; do not fight it with per-element border
  color utilities unless you have a reason.

---

## 8. Validation

```bash
pnpm check        # Biome, auto-fixes
pnpm check-types  # turbo run check-types
pnpm lint
pnpm build
```

Biome does not process Markdown, so this document and the skills are not
linted. They are still expected to be accurate — if you change a convention,
update them in the same change.

---

## 9. Traps

1. **Base UI, not Radix.** Use `render={<X />}`, never `asChild`. Nineteen
   components depend on this.
2. **Tabler, not Lucide.** Set in all four `components.json` files.
3. **No `toast` component.** Use the app-local Sonner wrapper from
   `@/components/ui/sonner`.
4. **`components.json` `ui` alias is `@/components` in all three apps**, but
   application code imports shared components from `@orgatick/ui/components/*`.
   Running `shadcn add` from an app directory creates an app-local fragment.
   Do not "fix" the alias — add shared components to `packages/ui`.
5. **Font variables are app-level, tokens are package-level.** Adding a font
   means editing all three root layouts; `packages/ui` only references the
   variable.
6. **There is no separate heading face.** `--font-heading` is Source Sans 3.
7. **Dark mode is class-based** via `next-themes`, not
   `prefers-color-scheme`. Do not add media-query dark styles.
8. **Cards use rings, not shadows.** Shadowing a card breaks the elevation
   model.
9. **`skills-lock.json` records the shadcn skill at `skills/shadcn/SKILL.md`**
   while it actually lives at `.agents/skills/shadcn/`. Cosmetic, but do not
   "repair" it as part of unrelated work.
10. **The generic shadcn skill describes components that are not installed
    here.** Always reconcile against the inventory in
    [§5](#5-component-inventory).
