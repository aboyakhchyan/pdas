# HyeWork

Freelance marketplace — Armenia first, then worldwide.

| Path | What |
|---|---|
| `apps/web` | Next.js — public site (hyework.am) |
| `apps/admin` | Next.js — admin panel (admin.hyework.am) |
| `apps/api` | NestJS — REST + WebSocket API (api.hyework.am) |
| `apps/mobile` | Flutter — iOS / Android |
| `packages/shared` | zod schemas, types, constants (single source of truth) |
| `packages/ui` | shared React components |
| `packages/api-client` | TS client generated from OpenAPI |
| `packages/eslint-config`, `packages/typescript-config` | shared tooling config |
| `infrastructure/` | Docker, compose, nginx, (future) terraform / k8s |
| `scripts/` | setup, codegen, deploy, db backup |

## Quick start

```bash
bash scripts/setup.sh   # install, copy .env files, start postgres/redis/meili/mailpit
pnpm dev                # web :3000 · admin :3001 · api :4000 (swagger: /docs)
```

## Useful

- `pnpm check` — lint + typecheck + test (everything except mobile)
- `pnpm gen:api` — regenerate API clients from the running API's OpenAPI spec
- `pnpm up -r --latest` — bump all deps to latest
