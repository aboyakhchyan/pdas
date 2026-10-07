---
name: db-migration
description: Change a persistence schema safely (Postgres migration or Firestore collection/index change).
---

1. Make sure local infra runs: `pnpm infra:up`.
2. Change only the owning bounded context's adapter in `infrastructure/`; the domain stays untouched.
3. Postgres: generate a named migration; never edit an already-applied one.
   Firestore: update collection shape and `firestore.indexes.json` together.
4. Changes must be backward compatible (expand → migrate data → contract in a later release):
   new fields optional or with default, no renames/drops in the same release as code changes.
5. Index every field used in hot filters and sorts.
6. Run api tests.
