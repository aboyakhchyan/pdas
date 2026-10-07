---
name: db-migration
description: Change a Firestore data shape or index safely (record schema, indexes, backfill). Use whenever a stored field is added, renamed, removed or queried in a new way.
---

# Firestore shape or index change

1. Change only the owning bounded context's adapter in `infrastructure/` and its zod record
   schema in `infrastructure/records/`; the domain stays untouched unless the model itself
   changes.
2. Update `infrastructure/firebase/firestore.indexes.json` together with any new query; index
   every field used in filters and sorts, exempt large maps (like document `content`) from
   indexing.
3. Changes must be backward compatible (expand → backfill → contract in a later release): new
   fields optional or defaulted in the record schema, no renames or drops in the same release.
4. Backfills run as idempotent scripts using batched writes (≤ 500 per batch).
5. Keep nesting under Firestore's 20-level limit and documents under 1 MiB.
6. Deploy rules and indexes before the code that relies on them, then run
   `pnpm --filter @pdas/api test`.
