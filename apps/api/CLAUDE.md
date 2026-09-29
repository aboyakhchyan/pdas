# apps/api — NestJS 12 (api.hyework.am)

Modular monolith: each domain is a Nest module that could later be extracted into its own service.

## Layout
- `src/main.ts` — bootstrap, global prefix `/v1`, Swagger at `/docs` (non-production)
- `src/config/env.ts` — env validated with zod; add every new env var here + `.env.example`
- `src/common/` — guards, interceptors, filters, decorators
- `src/infra/` — database, redis, queue, storage (S3), mail, search, i18n adapters
- `src/i18n/<locale>/<namespace>.json` — translation files (hy/ru/en) for nestjs-i18n
- `src/modules/<domain>/` — planned: auth, users, profiles, jobs, proposals, contracts,
  payments, messaging (websocket), reviews, notifications

## Rules
- Controllers are thin; logic in services. One module never touches another module's tables.
- Validate input with zod schemas from `@hyework/shared`.
- i18n for text the API generates (emails, notifications, translated API messages) via
  `nestjs-i18n` (`I18nService`/`@I18n()`), config in `src/infra/i18n/i18n.module.ts`. Locale is
  resolved from `?lang=`, `X-Lang`, or `Accept-Language`, falling back to `DEFAULT_LOCALE` from
  `@hyework/shared`. This is separate from zod request validation — nestjs-i18n's validation-pipe
  integration (built for class-validator) isn't used here.
- Slow side effects (email, push, indexing) → queue (BullMQ on Redis).
- Every endpoint: auth guard (unless public), Swagger decorators, unit test for the service.

## Commands
- `pnpm dev:api` · `pnpm --filter @hyework/api test` · `pnpm --filter @hyework/api typecheck`
