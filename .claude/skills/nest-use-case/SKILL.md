---
name: nest-use-case
description: Add a use case and its HTTP endpoint to an existing bounded context in apps/api (contract in packages/core, use case + spec, controller handler, presenter, module wiring). Use when the user asks for a new endpoint, action or query in an existing API module.
argument-hint: '<context> <use case, e.g. archive-document>'
---

Add `$1` to the `$0` context in `apps/api/src/modules/$0/`. Read the context's module, controller
and an existing use case + spec first and match them exactly. Layer templates:
`.claude/rules/api/`.

1. **Contract** — in `packages/core/src/$0/`: input schema + `*Input` type, response DTO schema
   if new, param/query schemas. Export new names from `packages/core/src/index.ts`. New
   permission → `PERMISSIONS` + `ROLE_PERMISSIONS`.
2. **Domain** — if the use case changes state, add an intention-revealing method to the entity
   (takes `now: Date`, bumps `revision` if the entity has one). New persistence need → add an
   abstract method to the port **and** implement it in the Firestore adapter and the in-memory
   fake.
3. **Use case** — `application/use-cases/<verb-noun>.use-case.ts`, class `<VerbNoun>`,
   `execute(principal?, ids..., input?)`. Load through the context's access service if one
   exists (e.g. `DocumentAccess.owned`), throw `DomainError`s, return the entity/result.
4. **Spec** — `<verb-noun>.use-case.spec.ts`: happy path, every error branch, ownership.
   Reuse the context fixture in `testing/`.
5. **Endpoint** — request classes in `presentation/requests/` (`implements` the core input,
   `@ContractField` per property), response class in `presentation/responses/`, handler with
   `@Auth(...)`, `@ApiOperation({ summary })` + `@Api*Response({ type })`, presenter mapping.
   Files: `@FileUpload(RULES)` + `@IncomingUpload(RULES) file: IncomingFile`.
6. **Wiring** — add the use case to `providers` in `$0.module.ts`; add to `exports` only if
   another context needs it.
7. **Data** — new query → index in `infrastructure/firebase/firestore.indexes.json`; record
   shape change → follow `/db-migration`.
8. Verify: `pnpm turbo run lint typecheck test --filter=@pdas/api...`, then `pnpm gen:api` if
   the API is running.
