<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Skills

Start with the `orgatick` skill for repo orientation, placement rules, and the
contracts-first workflow. It is in `.agents/skills/orgatick/`.

| Skill                                              | Covers                                                          |
| -------------------------------------------------- | --------------------------------------------------------------- |
| `orgatick`                                         | Repo map, ownership, dependency direction, validation workflow   |
| `organization-context`                             | Current-org cookie, `OrganizationContextGuard`, membership cache |
| `orgatick-design-system`                           | UI conventions: tokens, typography, badges, motion, components   |
| `api-response-contracts`                           | Response envelope and pagination schema factories                |
| `zod`                                              | Zod v4 patterns for writing schemas                             |
| `react-email`, `email-best-practices`, `orgatick-email-templates` | Email templates and delivery                     |

Placement rule of thumb: **business logic → `apps/backend`; shared wire shapes →
`packages/contract`; shared UI → `packages/ui`; participant UI → `apps/client`;
operator UI → `apps/organizer`; platform UI → `apps/admin`.** Packages never
import from `apps/`.
