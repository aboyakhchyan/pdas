# Architecture

```
            ┌──────────── nginx ────────────┐
 hyework.am │ admin.hyework.am │ api.hyework.am
     ▼              ▼                 ▼
  apps/web      apps/admin        apps/api  ◀── apps/mobile
  (Next.js)     (Next.js)         (NestJS)
                                    │
             ┌──────────┬───────────┼───────────┬────────────┐
          Postgres    Redis       AWS S3     Meilisearch    SMTP
                   (cache+queue)
```

## Principles
- **Modular monolith first.** One NestJS app, strict module boundaries. Extract a module into its own
  service only when it needs independent scaling (likely first: messaging, search, notifications).
- **Contracts in one place.** zod schemas in `packages/shared` → OpenAPI → generated TS + Dart clients.
- **Stateless apps.** Sessions/cache in Redis, files in S3 → any app can scale horizontally.
- **Async side effects.** Email, push, indexing, payouts through queues.
- **Money** as integer minor units + currency. Payment providers behind one interface
  (Idram, Ameriabank vPOS, Telcell → Stripe for worldwide).
- **i18n from day one:** hy, ru, en.

## Scaling path
1. Single server: docker compose + nginx (now)
2. Managed Postgres/Redis/S3 + multiple app servers behind a load balancer (terraform/)
3. Kubernetes + extracted services + read replicas + CDN (k8s/)
