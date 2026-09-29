---
name: nest-module
description: Scaffold a new NestJS domain module in apps/api with controller, service, DTOs, Swagger and tests.
---
1. Create `apps/api/src/modules/<name>/` with `<name>.module.ts`, `<name>.controller.ts`,
   `<name>.service.ts`, `<name>.service.spec.ts`, `dto/`.
2. Define request/response zod schemas in `packages/shared/src/<name>/` and export them from
   `packages/shared/src/index.ts`.
3. Register the module in `apps/api/src/app.module.ts`.
4. Add `@ApiTags` to the controller and `@ApiOperation`/`@ApiResponse` to each endpoint.
5. Run `pnpm --filter @hyework/api... check`, then `pnpm gen:api` if the API is running.
