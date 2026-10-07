---
paths:
    - 'apps/api/src/modules/*/domain/**/*.ts'
---

# API domain layer

Pure TypeScript. Allowed imports: `@pdas/core`, `src/common/interfaces/*`, `src/common/errors/*`,
and files of the same context's `domain/`. No `@nestjs/*`, `firebase-admin`, `zod` runtime
schemas of records, SDKs or `process.env`.

## interfaces/<name>.interface.ts — data shapes of the context

```ts
import type { Locale } from '@pdas/core';

export interface LegalSourceProps {
    id: string;
    title: string;
    locale: Locale;
    url: string;
    body: string;
    createdBy: string;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
}

export type LegalSourceSummary = Omit<LegalSourceProps, 'body'>;

export type NewLegalSource = Omit<LegalSourceProps, 'revision' | 'createdAt' | 'updatedAt'>;
```

- `interface` for object shapes, `type` for derived ones (`Omit`, `Pick`, unions).
- Dates are `Date`, never Firestore `Timestamp` or ISO strings.
- Shapes that clients also see belong in `packages/core`, not here.

## entities/<name>.entity.ts — behaviour around props

```ts
import type { Principal } from '@common/interfaces/principal.interface';
import type { LegalSourceProps, NewLegalSource } from '../interfaces/legal-source.interface';

export class LegalSource {
    private constructor(private props: LegalSourceProps) {}

    static create(source: NewLegalSource, now: Date): LegalSource {
        return new LegalSource({ ...source, revision: 1, createdAt: now, updatedAt: now });
    }

    static restore(props: LegalSourceProps): LegalSource {
        return new LegalSource({ ...props });
    }

    get id(): string {
        return this.props.id;
    }

    rename(title: string, now: Date): void {
        this.props = { ...this.props, title, revision: this.props.revision + 1, updatedAt: now };
    }

    toProps(): Readonly<LegalSourceProps> {
        return { ...this.props };
    }
}
```

- Private constructor; `create(input, now)` for new, `restore(props)` for loaded entities.
- State changes only through verb methods that take `now: Date`; never expose setters.
- Getters only for what callers actually need; everything else via `toProps()`.
- Access predicates live on the entity (`isOwnedBy(principal)`, `isReadableBy(principal)`).
- Copy arrays/objects in `restore` and `toProps` so callers can't mutate internal state.

## ports/<name>.repository.ts and ports/<name>.port.ts — outbound contracts

```ts
import type { LegalSource } from '../entities/legal-source.entity';
import type { LegalSourcePage, PageRequest } from '../interfaces/legal-source-page.interface';

export abstract class LegalSourceRepository {
    abstract findById(id: string): Promise<LegalSource | null>;
    abstract create(source: LegalSource): Promise<void>;
    abstract update(source: LegalSource, expectedRevision: number): Promise<void>;
    abstract list(page: PageRequest): Promise<LegalSourcePage>;
}
```

- Always an `abstract class` with only `abstract` members — it is also the Nest DI token.
- `*.repository.ts` for persistence of this context's aggregates; `*.port.ts` for any other
  outbound dependency (`IdentityProvider`, future `AiProvider`, `PdfRenderer`).
- Methods speak domain language and domain types; `find*` returns `null` when missing, the use
  case decides whether that is a `NotFoundError`.

## Pure domain functions

Rules that are not tied to one entity (see `modules/validation/domain/`) are exported functions in
a file named after the concept (`conditions.ts`, `formats.ts`), with a colocated `*.spec.ts`.
