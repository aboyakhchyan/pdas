# Professional Document Automation System (PDAS)

AI-driven generation of official Armenian documents (applications, contracts, powers of attorney,
statements, etc.) as ready-to-use PDF files. Armenia first, then worldwide.

This file is the single source of project instructions for every coding agent. `CLAUDE.md`
imports it; Codex reads it directly. Each app has its own `AGENTS.md` with app-specific rules —
read it before changing code in that app.

## Product

- Output format is **PDF only**. No DOCX, no HTML exports.
- Documents follow Armenian legislation and official templates. Primary sources:
  https://www.hartak.am/ (Armenian legal acts) and https://moj.gov.am/ (Ministry of Justice).
- AI provider is not chosen yet (Grok 4.3 or Gemini 3). Code against a provider interface,
  never against a vendor SDK directly. No AI integration until it is explicitly requested.
- Firebase is the platform: Auth (phone OTP, Google, Apple; roles via custom claims), Firestore
  (all data, no SQL database), Cloud Storage (files). Clients reach data only through the API.
  See docs/adr/0003-firebase-platform.md.

## Monorepo

- pnpm 10 workspaces + Turborepo. Node 24 (see .nvmrc). Always `pnpm`, never npm/yarn.
- `apps/web`, `apps/admin` — Next.js 16 App Router, React 19, Tailwind 4
- `apps/api` — NestJS 12, modular monolith with DDD bounded contexts (see apps/api/AGENTS.md)
- `apps/mobile` — React Native, latest stable, TypeScript (see apps/mobile/AGENTS.md)
- `packages/core` — zod schemas + types: the single source of truth for API contracts
- `packages/api-client` — typed HTTP client for web, admin and mobile
- `packages/ui` — shared React components, icons and styles for web + admin
- Shared dependency versions live in `catalog:` in `pnpm-workspace.yaml` — bump there.

## Commands

- `pnpm infra:up` — local redis / meilisearch / mailpit (Firestore and Storage use the dev
  Firebase project)
- `pnpm dev` | `pnpm dev:api` | `pnpm dev:web` | `pnpm dev:admin` | `pnpm dev:mobile` (Metro)
- `pnpm --filter @pdas/<pkg> <script>` — run in one package (`lint`, `typecheck`, `test`)
- `pnpm turbo run lint typecheck test --filter=@pdas/<pkg>...` — one package and its dependencies
- Before finishing any task: `pnpm check`

## Code style

- Clean, self-explanatory code. Names carry the meaning — no comments that restate the code.
  Comment only the non-obvious _why_.
- No ad-hoc constant dumps, magic-value files or grab-bag `utils.ts` / `helpers.ts`. A value or
  helper lives next to the code that owns it, or in `packages/core` when it is part of the
  contract.
- Small focused functions, early returns, no dead code, no commented-out code.
- One concept per file; the file name says what it holds (`*.entity.ts`, `*.interface.ts`,
  `*.repository.ts`, `*.use-case.ts`, ...). Follow the naming tables in the app's `AGENTS.md`.
- Prettier: 4 spaces, single quotes, trailing commas, print width 100. Imports are relative
  inside an app (apps/api has path aliases, see its `AGENTS.md`), `@pdas/*` across packages; `import type` for type-only imports.

## Rules

- i18n: all user-facing text must be translatable — hy (default), en, ru. No hardcoded UI strings.
- Money (subscriptions, paid documents): integer minor units + currency code (`Money` in
  packages/core). Never floats.
- API contract change → update zod schema in packages/core → `pnpm gen:api`.
- Bounded contexts talk only through exported application services / domain events, never through
  another context's storage.
- Never read or commit `.env` files or secrets. Config goes through `.env.example`.
- Keep infra changes (Dockerfiles, nginx, Jenkinsfile) in sync when adding a new app.
- Firestore shape or index change → follow the `db-migration` skill (backward compatible, indexes
  in `infrastructure/firebase/firestore.indexes.json`).
- Do not push, force-push or rewrite git history; leave committing to the user unless asked.

## Agent tooling

Both Claude Code and Codex are configured for this repo. When you change a workflow, update both
sides so they stay equivalent:

| Purpose                  | Claude Code                            | Codex                                 |
| ------------------------ | -------------------------------------- | ------------------------------------- |
| Project instructions     | `CLAUDE.md` → imports `AGENTS.md`      | `AGENTS.md` (root + each app)         |
| Per-layer code templates | `.claude/rules/**` (auto-load by path) | read the same files on demand         |
| Workflows                | `.claude/skills/*/SKILL.md`            | `.agents/skills/*/SKILL.md`           |
| Subagents                | `.claude/agents/*.md`                  | `.codex/agents/*.toml`                |
| Format on edit           | `.claude/hooks/format.sh`              | `.codex/hooks.json` + `.codex/hooks/` |
| Command permissions      | `.claude/settings.json`                | `.codex/rules/default.rules`          |
| MCP servers              | `.mcp.json`                            | `.codex/config.toml`                  |

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
