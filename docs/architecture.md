# Architecture

```
            ┌──────────── nginx ────────────┐
 pdas.am │ admin.pdas.am │ api.pdas.am
     ▼              ▼                 ▼
  apps/web      apps/admin        apps/api  ◀── apps/mobile
  (Next.js)     (Next.js)         (NestJS)      (React Native)
                                    │
     ┌─────────────┬────────────┬───┴────────┬──────────────┬──────────────┐
  Firebase      Firestore     Firebase     AI provider    Redis        Meilisearch
  Auth (roles)  (all data)    Storage     (Grok/Gemini)  (cache+queue) (template search)
```

## Domain

The system turns a user's intent ("I need a power of attorney for a car") into a legally correct
Armenian document rendered as PDF.

Flow: pick or describe a document → collect required fields → AI drafts content from an approved
template + legal sources → validation → PDF render → stored in Firebase Storage → delivered to the user.

## Bounded contexts (DDD)

- **identity** — users, roles (Firebase Auth custom claims: `user`, `admin`, `super-admin`).
- **templates** — document types, versioned templates, required fields per type.
- **legal-sources** — normalized legal acts and official forms gathered from
  [hartak.am](https://www.hartak.am/) and [moj.gov.am](https://moj.gov.am/).
- **generation** — orchestrates AI drafting behind an `AiProvider` port (Grok 4.3 or Gemini 3, TBD).
- **documents** — generated documents, their versions and PDF files.
- **rendering** — deterministic PDF rendering from validated content.
- **notifications** — email through the Firebase Trigger Email extension; templates per locale.
- **billing** — plans and paid documents (`Money` from packages/core).

Each context: `domain` (entities, value objects, domain events, ports) → `application`
(use cases) → `infrastructure` (adapters: Firestore, Firebase Storage, AI, PDF) → `presentation` (controllers).
Dependencies point inward only.

## Principles

- **PDF only.** One output format, rendered deterministically; AI produces content, never layout.
- **Vendor-neutral.** AI, auth, storage and persistence sit behind ports; swapping a vendor touches
  only an adapter.
- **Contracts in one place.** zod schemas in `packages/core` → OpenAPI → generated TS clients for
  web, admin and mobile.
- **Stateless apps.** Cache in Redis, files in Firebase Storage → any app can scale horizontally.
- **Async side effects.** AI generation, PDF rendering, email, indexing through queues.
- **i18n from day one:** hy (default), en, ru.

## Scaling path

1. Single server: docker compose + nginx (now)
2. Managed services + multiple app servers behind a load balancer (terraform/)
3. Kubernetes + extracted services (generation, rendering first) + CDN (k8s/)
