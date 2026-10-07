# ADR 0002 — Pivot to Professional Document Automation System

**Status:** accepted

## Context

The project started as a freelance marketplace. It now becomes a system that generates official
Armenian documents with AI. The monorepo, tooling and tech stack stay; the domain changes.

## Decision

- Domain: AI-assisted generation of Armenian legal and administrative documents, PDF output only.
- Knowledge sources: [hartak.am](https://www.hartak.am/), [moj.gov.am](https://moj.gov.am/).
- Backend architecture: DDD bounded contexts inside the NestJS modular monolith.
- Auth and roles: Firebase Auth with custom claims. Document data: Firestore. Both planned,
  integrated later.
- AI: Grok 4.3 or Gemini 3, decision pending; always behind an `AiProvider` port.
- Mobile: React Native (latest) replaces Flutter.
- Locales: hy (default), en, ru.

## Consequences

- Marketplace concepts (jobs, proposals, contracts, payouts, messaging) are dropped.
- Existing Postgres/Redis/Meilisearch/S3 infra stays; each context's persistence is chosen per
  adapter.
