# Next.js apps — client / organizer / admin

Next.js 16 App Router, React 19, Tailwind v4, TypeScript. All three apps share
the same shape; only `client` and `organizer` currently have substantial pages,
`admin` is partially built.

| App         | Port | Audience                          | Implemented                                      |
| ----------- | ---- | --------------------------------- | ------------------------------------------------ |
| `client`    | 3000 | attendees + public marketing site | marketing, legal, auth, account, events           |
| `organizer` | 3001 | organization operators            | dashboard shell, org create flow, verification    |
| `admin`     | 3002 | platform staff                    | users + organizations (members/access/documents/closure) |

## Directory conventions

No `src/` directory — code lives at the app root.

```text
app/
  layout.tsx              root layout (html/body, fonts, providers, metadata)
  globals.css             Tailwind v4 entry, imports the shared theme
  error.tsx loading.tsx not-found.tsx   (present in organizer/admin)
  (route-group)/          route groups, do not affect the URL
    feature/
      page.tsx layout.tsx loading.tsx error.tsx
      _components/        route-private components
      _services/          data access for this route group
      _store/             zustand stores scoped to this group
      _types/             local types for this group
      _constants/         local constants
      _steps/             multi-step form steps (organizer org creation)
      components/         same-name subfolders, e.g. login-form/
      [id]/               dynamic segment
components/               app-wide components (navbar, footer, sidebar, ui)
lib/                      apis/, categories, fetcher, hooks
config/                   metadata.ts (site Metadata)
hooks/                    app-wide hooks
providers/                Providers, theme-provider, toast-provider
public/
```

Conventions worth copying exactly:

- `_`-prefixed folders are **private to their route** — colocated components,
  services, stores, types. Public imports only from `components/`, `lib/`,
  `hooks/`, `providers/`.
- Route-group names map to intent: `(auth)`, `(account)`, `(marketing)`,
  `(legal)` in `client`; `(dashboard)`, `(organizations)` in organizer/admin.
- Route files export `metadata` with an explicit title:
  `export const metadata: Metadata = { title: "Organization Overview" };`
- Dynamic route params are awaited (Next 15+/16):
  `const { id } = await params;`
- Server Components fetch directly and pass data down. Pages do not become
  client components just to fetch.

Only `apps/client` and `apps/organizer` depend on `@orgatick/address`;
`admin` depends on `contracts` and `ui` only.

## Aliases

`tsconfig.json` in each app:

```json
"paths": {
  "@/*": ["./*"],
  "@orgatick/ui/*": ["../../packages/ui/src/*"]
}
```

- `@/...` = the app's own root, so `@/lib/apis/auth.api`, `@/app/(auth)/_components/EmailView`.
- `@orgatick/ui/*` is mapped to package **source**, so imports look like
  `@orgatick/ui/components/button`, `@orgatick/ui/lib/utils`.
- `@orgatick/contracts` is **not** aliased — it resolves through its `exports`
  map to built `dist/`. This is the single most common source of "my change isn't
  showing up" confusion; see `tooling-and-validation.md`.
- `@orgatick/address` also resolves via `exports` to source.

## API access

Two clients, both axios, both `withCredentials: true`:

| File                                   | Used for                                                     |
| -------------------------------------- | ------------------------------------------------------------ |
| `lib/apis/base.api.ts`                 | plain instance, no auth header (rarely used directly)          |
| `lib/apis/auth.api.ts`                 | default export `api` — in-memory token + Bearer + 401 refresh/queue |
| `lib/apis/server-auth-api.ts`          | `serverApi()` for Server Components/Actions; forwards HttpOnly cookies |
| `lib/apis/api-error.ts`                | `getApiErrorMessage`, `handleApiError`, `isEmailUnverifiedError` |
| `lib/fetcher.ts`                       | tiny SWR-style fetcher around `api.get`                        |

Base URL comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:5050`).
Feature-specific clients live beside their route (`app/(auth)/_services/auth.service.ts`)
or in `lib/apis/` when shared (e.g. `lib/apis/address.api.ts`, `lib/apis/verification.api.ts`).

### Unwrapping the envelope

The backend wraps responses, so a list payload arrives as
`response.data.data.items`. Services read that explicitly, and
`extractArray` exists in the address clients to tolerate the several shapes:

```ts
async getCurrentOrganization(api: AxiosInstance) {
  const response = await api.get("/session/organization");
  const current = response.data?.data ?? null;
  return current?.id ? String(current.id) : null;
}
```

### Server-side auth

`serverApi()` reads `next/headers` cookies and forwards the `Cookie` header plus a
Bearer token if one is present in a known cookie name. It handles a single
concurrent 401 → `POST /auth/refresh` → retry, deduplicated via a shared promise,
and propagates refreshed cookies back into the Next cookie store when the context
allows it. Use it for any server-side data access; do not hand-roll headers.

Route protection is done in layouts, not `middleware.ts` (no middleware files
exist). `organizer`'s root layout is async and gates rendering:

```tsx
export default async function RootLayout({ children }) {
  let user: null | UserResponse = null;
  const api = await serverApi();
  try { user = (await api.get("/users/me")).data.data; } catch { user = null; }
  return (<html ...><body ...><Providers>{!user ? <RestrictedAccess /> : children}</Providers></body></html>);
}
```

## State

Zustand with the `persist` middleware, scoped per route group
(`app/(auth)/_store/auth.store.ts`):

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: false,
    setAuth: (user, token) => {
      if (token) setAccessToken(token); else clearAccessToken();
      set({ user, token, isAuthenticated: Boolean(token || user) });
    },
    ...
  }), { name: "orgatick-auth", /* ... */ }),
);
```

Stores call `setAccessToken` / `clearAccessToken` from `lib/apis/auth.api` so the
in-memory token and the persisted state never diverge. Store state types live in
the sibling `_types/` folder. Do not put server data in a persisted store; use
Server Components for that.

## Forms

`react-hook-form` + `@hookform/resolvers/zod` with the **shared contract schema**
as resolver — this is the mechanism that keeps frontend and backend validation in
sync. Components are built from `Field`/`FieldGroup`/`FieldLabel`/`FieldError`
in `@orgatick/ui`, controlled per field:

```tsx
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel className="text-md">Email</FieldLabel>
      <Input {...field} type="email" aria-invalid={fieldState.invalid}
        onChange={(e) => { field.onChange(e); if (shouldRevalidate("email")) void form.trigger("email"); }} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

Always pass the contract's `*Dto` type as the form type
(`UseFormReturn<LoginData>`). Multi-step flows split steps into `_steps/`
(organizer org creation) or per-step component folders (`login/components/login-form/`).

## Imports from `@orgatick/ui`

Import per-component subpaths; there is no barrel:

```tsx
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { cn } from "@orgatick/ui/lib/utils";
```

Style merging always goes through `cn` (clsx + tailwind-merge), never string
concatenation. If a component you need does not exist, add it to
`packages/ui` first rather than forking it locally.

Available components (49): accordion, alert, alert-dialog, aspect-ratio,
attachment, autocomplete, avatar, badge, breadcrumb, button, button-group, card,
carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer,
dropdown-menu, empty, field, glow, hover-card, input, input-group, input-otp,
item, label, mockup, pagination, password-input, phone-input, popover, progress,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, spinner,
switch, table, tabs, textarea, tooltip.

Not installed: `calendar`, `form`, `menubar`, `navigation-menu`, `radio-group`,
`slider`, `toggle`, `toggle-group`, `toast`. Toasts use the app-local Sonner
wrapper. The full inventory and UI conventions live in
`docs/design-system.md` — read it before styling or adding a component.

App-local `components/ui/` holds only thin app-specific pieces
(`client/components/ui/link-button.tsx`, `sonner.tsx`) — not copies of the
shared primitives.

Icons come from `@tabler/icons-react` (e.g. `IconLoader2`). Never a second icon
family.

## Styling and theming

Tailwind v4 with no `tailwind.config.js` — the theme is CSS-first. Each app's
`app/globals.css` starts with `@import "tailwindcss"` and the shared token block
from `packages/ui/src/styles/globals.css`.

- Tokens are CSS custom properties mapped through `@theme inline`
  (`--color-primary`, `--color-muted-foreground`, `--radius-*`, sidebar and chart
  tokens) with light values in `:root` and a `.dark` block. `dark:` utilities work
  via `@custom-variant dark (&:is(.dark *))`.
- Brand values: `--primary: #204b90`, `--background: #f4f7fc`,
  `--foreground: #1a2b4c`.
- Do not hardcode hex values in components; use semantic tokens
  (`bg-primary`, `text-muted-foreground`, `bg-muted`).
- Dark mode is class-based via `next-themes`; wrap in `providers/theme-provider.tsx`
  and put `suppressHydrationWarning` on `<html>` (already done in every root layout).
- Fonts: `next/font/google` — `Source_Sans_3` with `variable: "--font-sans"` and
  `Source_Code_Pro` with `variable: "--font-source-code-pro"`, both applied on the
  `<html>` className with `cn("antialiased", "font-sans", ...)`.
  `packages/ui` maps `--font-mono: var(--font-source-code-pro)` and
  `--font-heading: var(--font-sans)` (there is no separate heading face). Adding a
  font means editing all three root layouts.
- UI conventions (typography ramp, the strict badge/status rule, the motion
  budget, card and form composition) are in `docs/design-system.md` and the
  `orgatick-design-system` skill. Read it before styling UI.

## Next config

```js
const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.1.60", "10.224.52.173", "dev.orgatick.site"],
  images: { remotePatterns: [{ protocol: "https", hostname: "assets.orgatick.in", pathname: "/**" }] },
};
```

Remote images must come from `assets.orgatick.in` (or another host you add here).
No `transpilePackages` is configured — that is fine for `ui`/`address` (already TS
source) but is why `contracts` must be built.

## Scripts

Identical across the three apps:

```json
"dev": "next dev -p <port>",
"build": "next build",
"check-types": "next typegen && tsc --noEmit",
"lint": "biome check .",
"clean": "rm -rf .next dist out .turbo"
```

`next typegen` runs first because route types (e.g. `LayoutProps<"/">`) are
generated. Run `check-types` after adding or moving a route.