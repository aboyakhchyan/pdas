---
name: nest-module
description: Scaffold a new DDD bounded context (NestJS module) in apps/api with domain, application, infrastructure, presentation layers, Swagger and tests. Use when the user asks for a new module, context or feature area in the API — not for one more endpoint in an existing context (use nest-use-case for that).
---

# New bounded context in apps/api

The user names the context (kebab-case, e.g. `legal-sources`). Before writing code read
`apps/api/AGENTS.md` (placement and naming) and the layer templates in `.claude/rules/api/`
(`domain.md`, `application.md`, `infrastructure.md`, `presentation.md`) plus
`.claude/rules/testing.md`. Use `apps/api/src/modules/documents/` as the reference
implementation.

1. **Model first.** Agree on the aggregate(s), their props, invariants and the use cases with the
   user if they are not obvious. Name the Firestore collection(s) (camelCase plural).
2. **Contract** — `packages/core/src/<context>/<entity>.ts`: request schemas + `*Input` types,
   response schemas + `*Dto` types, `<entity>IdSchema`; export from `packages/core/src/index.ts`.
   New permissions → `PERMISSIONS` + `ROLE_PERMISSIONS` in `packages/core/src/identity/access.ts`.
3. **Domain** — `domain/interfaces/<entity>.interface.ts` (`<Entity>Props`, `New<Entity>`, ...),
   `domain/entities/<entity>.entity.ts`, `domain/ports/<entity>.repository.ts` (abstract class)
   and any `domain/ports/<name>.port.ts`.
4. **Application** — one `application/use-cases/<verb-noun>.use-case.ts` per use case; shared
   logic in `application/services/`; multi-value results in `application/interfaces/`.
5. **Infrastructure** — `infrastructure/records/<entity>.record.ts` (zod, Timestamp → Date) and
   `infrastructure/firestore-<entity>.repository.ts` extending the port. Add indexes for every
   query to `infrastructure/firebase/firestore.indexes.json`.
6. **Presentation** — `presentation/requests/*.request.ts` (classes `implements` the core input,
   `@ContractField(schema.shape.x)` per property), `presentation/responses/*.response.ts`
   (`@ContractProperty`), `presentation/controllers/<plural>.controller.ts` (thin, `@Auth(...)`,
   `@ApiOperation` + `@Api*Response({ type })`, `@FileUpload`/`@IncomingUpload` for files),
   `presentation/presenters/<entity>.presenter.ts`.
7. **Wiring** — `<context>.module.ts`: use cases + `{ provide: Port, useClass: Adapter }`;
   `exports` only the application classes other contexts may call. Register in
   `src/app.module.ts`.
8. **Tests** — `testing/in-memory-<entity>.repository.ts`, a `testing/<context>-fixture.ts` if
   more than two specs share setup, and a `*.use-case.spec.ts` for every use case.
9. **i18n** — new error messages or generated text in `src/i18n/{hy,en,ru}/*.json`.
10. Verify: `pnpm turbo run lint typecheck test --filter=@pdas/api...`. If the API is running,
    `pnpm gen:api`.

Don't add folders the context doesn't need, and don't create `utils/`, `helpers/`, `constants/`
or `types/` folders.
