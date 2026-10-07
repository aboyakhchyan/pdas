# apps/api — NestJS 11 (api.pdas.am)

Modular monolith built from DDD bounded contexts. Each context is a Nest module that could later
be extracted into its own service.

## Layout

- `src/main.ts` — bootstrap, global prefix `/v1`, Swagger at `/docs` (non-production)
- `src/config/env.ts` — env validated with zod; add every new env var here + `.env.example`
- `src/common/` — guards, interceptors, filters, decorators
- `src/infra/` — shared adapters: database, redis, queue, storage (Firebase Storage), mail, search, i18n
- `src/i18n/<locale>/<namespace>.json` — translation files (hy/en/ru) for nestjs-i18n
- `src/modules/<context>/` — planned contexts: identity, templates, legal-sources, generation,
  documents, rendering, billing (see docs/architecture.md)

## Bounded context layout

```
src/modules/<context>/
  domain/          entities, value objects, domain events, repository + provider ports
  application/     use cases (one class per use case), DTO mapping
  infrastructure/  adapters implementing domain ports (Firestore, Firebase Storage, AI, PDF)
  presentation/    controllers
  <context>.module.ts
```

- `domain` has no Nest, ORM, SDK or HTTP imports. Dependencies point inward only.
- Ports are bound to adapters in `<context>.module.ts` via injection tokens.
- Another context is reached only through its exported application service or a domain event.

## Rules

- Controllers are thin and only call use cases.
- Validate input with zod schemas from `@pdas/core`.
- AI goes through an `AiProvider` port (Grok 4.3 or Gemini 3, TBD). No vendor SDK outside its
  adapter. Not integrated yet — do not add until asked.
- Auth: Firebase Auth ID tokens + custom-claim roles (`user`, `lawyer`, `admin`). Planned, not
  integrated yet.
- Output documents are PDF only, rendered deterministically from validated content.
- i18n for text the API generates (emails, notifications, translated API messages) via
  `nestjs-i18n` (`I18nService`/`@I18n()`), config in `src/infra/i18n/i18n.module.ts`. Locale is
  resolved from `?lang=`, `X-Lang`, or `Accept-Language`, falling back to `DEFAULT_LOCALE` from
  `@pdas/core`.
- Slow work (AI generation, PDF rendering, email, indexing) → queue (BullMQ on Redis).
- Every endpoint: auth guard (unless public), Swagger decorators, unit test for the use case.

## Commands

- `pnpm dev:api` · `pnpm --filter @pdas/api test` · `pnpm --filter @pdas/api typecheck`
