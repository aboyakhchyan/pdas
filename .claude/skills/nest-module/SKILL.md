---
name: nest-module
description: Scaffold a new DDD bounded context (NestJS module) in apps/api with domain, application, infrastructure, presentation layers, Swagger and tests.
---

1. Create `apps/api/src/modules/<context>/`:
    - `domain/` — entities, value objects, domain events, repository/provider ports (no Nest imports)
    - `application/` — one use case per file, with `<use-case>.spec.ts`
    - `infrastructure/` — adapters implementing the ports
    - `presentation/<context>.controller.ts`
    - `<context>.module.ts` — binds ports to adapters via injection tokens
2. Define request/response zod schemas in `packages/core/src/<context>/` and export them from
   `packages/core/src/index.ts`.
3. Register the module in `apps/api/src/app.module.ts`.
4. Add `@ApiTags` to the controller and `@ApiOperation`/`@ApiResponse` to each endpoint.
5. Run `pnpm --filter @pdas/api... check`, then `pnpm gen:api` if the API is running.
