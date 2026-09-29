# HyeWork

Freelance marketplace (like Upwork) — Armenia first, then worldwide.

## Monorepo
- pnpm 10 workspaces + Turborepo. Node 24 (see .nvmrc). Always `pnpm`, never npm/yarn.
- `apps/web`, `apps/admin` — Next.js 16 App Router, React 19, Tailwind 4
- `apps/api` — NestJS 11, modular monolith (see apps/api/CLAUDE.md)
- `apps/mobile` — Flutter, Riverpod, go_router, dio (see apps/mobile/CLAUDE.md)
- `packages/shared` — zod schemas + types: the single source of truth for API contracts
- `packages/ui` — shared React components for web + admin
- Shared dependency versions live in `catalog:` in `pnpm-workspace.yaml` — bump there.

## Commands
- `pnpm infra:up` — local postgres / redis / meilisearch / mailpit
- File storage is AWS S3 (a `hyework-dev` bucket for local dev), not emulated locally
- `pnpm dev` | `pnpm dev:api` | `pnpm dev:web` | `pnpm dev:admin`
- `pnpm --filter @hyework/<pkg> <script>` — run in one package
- Before finishing any task: `pnpm check`

## Rules
- i18n: all user-facing text must be translatable (hy, ru, en). No hardcoded strings in UI.
- Money: integer minor units + currency code (`Money` in packages/shared). Never floats.
- API contract change → update zod schema in packages/shared → `pnpm gen:api`.
- Backend modules talk only through exported services / events, never another module's DB tables.
- Never read or commit `.env` files or secrets. Config goes through `.env.example`.
- Keep infra changes (Dockerfiles, nginx, Jenkinsfile) in sync when adding a new app.
