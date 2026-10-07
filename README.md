# Professional Document Automation System (PDAS)

AI generation of official Armenian documents as PDF.

| Path                                                   | What                                                     |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `apps/web`                                             | Next.js — public site (pdas.am)                       |
| `apps/admin`                                           | Next.js — admin panel (admin.pdas.am)                 |
| `apps/api`                                             | NestJS — REST API, DDD bounded contexts (api.pdas.am) |
| `apps/mobile`                                          | React Native — iOS / Android                             |
| `packages/core`                                        | zod schemas, types (single source of truth)              |
| `packages/ui`                                          | shared React components                                  |
| `packages/api-client`                                  | TS client generated from OpenAPI                         |
| `packages/eslint-config`, `packages/typescript-config` | shared tooling config                                    |
| `infrastructure/`                                      | Docker, compose, nginx, (future) terraform / k8s         |
| `scripts/`                                             | setup, codegen, deploy                                   |

## Quick start

```bash
bash scripts/setup.sh   # install, copy .env files, start redis/meili/mailpit
pnpm dev                # web :3000 · admin :3001 · api :4000 (swagger: /docs)
```

## Useful

- `pnpm check` — lint + typecheck + test
- `pnpm gen:api` — regenerate API clients from the running API's OpenAPI spec
- `pnpm up -r --latest` — bump all deps to latest
