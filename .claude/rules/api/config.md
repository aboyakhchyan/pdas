---
paths:
    - 'apps/api/src/config/**/*.ts'
    - 'apps/api/src/main.ts'
    - 'apps/api/.env.example'
---

# API configuration

Flow: `process.env` → `env.schema.ts` (zod, UPPER_CASE names) → `configuration.ts`
(`loadConfiguration()` maps to camelCase namespaces) → `ConfigModule` (global, cached, no direct
env access) → `ConfigService<Configuration, true>`.

Adding a variable:

1. `env.schema.ts` — add the UPPER_CASE key with coercion/defaults (`z.coerce.number()`, enums).
2. `config/interfaces/configuration.interface.ts` — add the field to the right namespace
   interface (`AppConfig`, `FirebaseConfig`, `RedisConfig`) or a new `<Name>Config` namespace.
3. `configuration.ts` — map it in `toConfiguration(env)`.
4. `apps/api/.env.example` and `infrastructure/compose/*.yml` / `.env.example` — document it.
5. Read it where needed: `config.get('<namespace>', { infer: true })`.

Never read `process.env` outside `src/config/`, never read or print `.env` files, never put real
values in `.env.example`. Invalid env must fail fast at boot (`InvalidEnvironmentError`).
