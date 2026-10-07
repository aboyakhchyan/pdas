---
paths:
    - 'apps/api/src/modules/*/infrastructure/**/*.ts'
    - 'apps/api/src/infra/**/*.ts'
---

# API infrastructure layer

Adapters that implement domain ports. The only place where `firebase-admin`, vendor SDKs and
Firestore types appear. One adapter per port per technology.

## records/<name>.record.ts — stored shape

```ts
import { localeSchema } from '@pdas/core';
import { z } from 'zod';
import { firestoreTimestampSchema } from '@infra/firebase/firestore-timestamp.schema';

export const legalSourceRecordSchema = z.object({
    title: z.string(),
    locale: localeSchema,
    url: z.url(),
    body: z.string(),
    createdBy: z.string(),
    revision: z.int().positive(),
    createdAt: firestoreTimestampSchema,
    updatedAt: firestoreTimestampSchema,
});
```

- The Firestore document ID is the entity `id` — it is not part of the record.
- Reuse enum/value schemas from `@pdas/core`; timestamps via `firestoreTimestampSchema`.
- A shape change follows the `db-migration` skill: new fields optional or defaulted, no renames.

## firestore-<name>.repository.ts

```ts
import { Injectable } from '@nestjs/common';
import { type CollectionReference, Firestore } from 'firebase-admin/firestore';
import { ConflictError } from '@common/errors/domain-error';
import { LegalSource } from '../domain/entities/legal-source.entity';
import { LegalSourceRepository } from '../domain/ports/legal-source.repository';
import { legalSourceRecordSchema } from './records/legal-source.record';

@Injectable()
export class FirestoreLegalSourceRepository extends LegalSourceRepository {
    private readonly sources: CollectionReference;

    constructor(private readonly firestore: Firestore) {
        super();
        this.sources = firestore.collection('legalSources');
    }

    async findById(id: string): Promise<LegalSource | null> {
        const snapshot = await this.sources.doc(id).get();
        if (!snapshot.exists) return null;
        return LegalSource.restore({ id, ...legalSourceRecordSchema.parse(snapshot.data()) });
    }

    async create(source: LegalSource): Promise<void> {
        const { id, ...record } = source.toProps();
        await this.sources.doc(id).create(record);
    }

    async update(source: LegalSource, expectedRevision: number): Promise<void> {
        const { id, ...record } = source.toProps();
        const reference = this.sources.doc(id);

        await this.firestore.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(reference);
            if (snapshot.get('revision') !== expectedRevision) throw new ConflictError();
            transaction.set(reference, record);
        });
    }
}
```

- `extends` the port (abstract class) and calls `super()`.
- Inject `Firestore` / `Auth` / `Storage` from `FirebaseModule` (global) — never call
  `getFirestore()` or `initializeApp()` yourself.
- Collection names are camelCase plural; subcollections through a private helper
  (`private attachments(documentId)`).
- Parse every snapshot with the record schema; write `toProps()` minus `id` (Firestore stores
  `Date` as `Timestamp` automatically, `undefined` fields are ignored).
- `create` for inserts, `set` for upserts, `runTransaction` for read-modify-write,
  `recursiveDelete` when there are subcollections.
- Lists: `.limit(limit + 1)` to compute `nextCursor`, opaque base64url cursor validated with zod
  (invalid cursor → `RequestInvalidError`), `.select(...)` for summaries, hard upper bounds as a
  file-level `const MAX_* = ...`.
- Every `where` + `orderBy` combination gets an index in
  `infrastructure/firebase/firestore.indexes.json`.
- Private helpers (`encodeCursor`, `decodeCursor`) are plain functions at the bottom of the file.

## Vendor adapters — firebase-<name>.provider.ts, <vendor>-<name>.<kind>.ts

Implement a `*.port.ts` (`FirebaseIdentityProvider extends IdentityProvider`). Translate vendor
errors into `DomainError`s and vendor types into domain types at the boundary; nothing
vendor-specific leaks out. AI adapters (`AiProvider`) are not to be added until requested.

## Logging inside adapters

Use `new Logger(MyAdapter.name)`. The log sink itself (`FirestoreLogSink`) must never log through
Nest — it reports its own failures to stderr to avoid recursion.

## Shared adapters — src/infra/<name>/

Used when several contexts need the same port (e.g. `FileStorage`). Layout:
`<name>.ts` (abstract port), `<vendor>-<name>.ts` (adapter), `interfaces/` (its types),
`<name>.module.ts` (`@Global()`, `providers: [{ provide: Port, useClass: Adapter }]`,
`exports: [Port]`), registered once in `app.module.ts`. Config comes from
`ConfigService<Configuration, true>` with `config.get('<namespace>', { infer: true })`.
