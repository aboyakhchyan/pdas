# Professional Document Automation System (PDAS)

AI-driven generation of official Armenian documents (applications, contracts, powers of attorney,
statements, etc.) as ready-to-use PDF files. Armenia first, then worldwide.

## Product

- Output format is **PDF only**. No DOCX, no HTML exports.
- Documents follow Armenian legislation and official templates. Primary sources:
  https://www.hartak.am/ (Armenian legal acts) and https://moj.gov.am/ (Ministry of Justice).
- AI provider is not chosen yet (Grok 4.3 or Gemini 3). Code against a provider interface,
  never against a vendor SDK directly. No AI integration until it is explicitly requested.
- Planned, not integrated yet: Firebase Auth (sign-in + roles via custom claims) and Firestore.
  Do not add Firebase code until asked.

## Monorepo

- pnpm 10 workspaces + Turborepo. Node 24 (see .nvmrc). Always `pnpm`, never npm/yarn.
- `apps/web`, `apps/admin` — Next.js 16 App Router, React 19, Tailwind 4
- `apps/api` — NestJS 11, modular monolith with DDD bounded contexts (see apps/api/CLAUDE.md)
- `apps/mobile` — React Native, latest stable, TypeScript (see apps/mobile/CLAUDE.md)
- `packages/core` — zod schemas + types: the single source of truth for API contracts
- `packages/ui` — shared React components for web + admin
- Shared dependency versions live in `catalog:` in `pnpm-workspace.yaml` — bump there.

## Commands

- `pnpm infra:up` — local postgres / redis / meilisearch / mailpit
- File storage is Cloud Storage for Firebase (planned, not integrated yet)
- `pnpm dev` | `pnpm dev:api` | `pnpm dev:web` | `pnpm dev:admin` | `pnpm dev:mobile` (Metro)
- `pnpm --filter @pdas/<pkg> <script>` — run in one package
- Before finishing any task: `pnpm check`

## Code style

- Clean, self-explanatory code. Names carry the meaning — no comments that restate the code.
  Comment only the non-obvious _why_.
- No ad-hoc constant dumps or magic-value files. A value lives next to the code that owns it,
  or in `packages/core` when it is part of the contract.
- Small focused functions, early returns, no dead code, no commented-out code.

## Rules

- i18n: all user-facing text must be translatable — hy (default), en, ru. No hardcoded UI strings.
- Money (subscriptions, paid documents): integer minor units + currency code (`Money` in
  packages/core). Never floats.
- API contract change → update zod schema in packages/core → `pnpm gen:api`.
- Bounded contexts talk only through exported application services / domain events, never through
  another context's storage.
- Never read or commit `.env` files or secrets. Config goes through `.env.example`.
- Keep infra changes (Dockerfiles, nginx, Jenkinsfile) in sync when adding a new app.
