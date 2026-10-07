---
paths:
    - 'apps/api/src/modules/*/application/**/*.ts'
    - 'apps/api/src/common/errors/**/*.ts'
---

# API application layer

Orchestrates the domain through ports. Depends on ports (abstract classes), domain entities,
`src/common/*` and other contexts' **exported** application classes. Never on adapters,
`Firestore`, `ConfigService` or anything from `presentation/`.

## use-cases/<verb-noun>.use-case.ts

```ts
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CreateLegalSourceInput } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import { LegalSource } from '../../domain/entities/legal-source.entity';
import { LegalSourceRepository } from '../../domain/ports/legal-source.repository';

@Injectable()
export class CreateLegalSource {
    constructor(private readonly sources: LegalSourceRepository) {}

    async execute(principal: Principal, input: CreateLegalSourceInput): Promise<LegalSource> {
        const source = LegalSource.create(
            { id: randomUUID(), createdBy: principal.uid, ...input },
            new Date(),
        );
        await this.sources.create(source);
        return source;
    }
}
```

- One class, one public `execute`. Class name = verb phrase, no `UseCase` suffix.
- Argument order: actor (`principal`), resource ids, input DTO from `@pdas/core`.
- Return entities or `application/interfaces/*` results — never DTOs; mapping is the
  presenter's job.
- Guard clauses first, each throwing a `DomainError`; then the happy path.
- `new Date()` once per execution, passed to entity methods as `now`.
- Ports are imported as values (not `import type`) because Nest resolves them at runtime.

## services/<name>.service.ts — shared application logic

Use a service when several use cases of the context share logic (e.g. `DocumentAccess` loads a
document and enforces ownership) or when another context needs it. To expose it, add it to the
module's `exports`; that exported class is the context's public API.

```ts
@Injectable()
export class DocumentAccess {
    constructor(private readonly documents: DocumentRepository) {}

    async owned(principal: Principal, documentId: string): Promise<Document> {
        const document = await this.documents.findById(documentId);
        if (!document?.isOwnedBy(principal)) throw new NotFoundError();
        return document;
    }
}
```

## interfaces/<name>.interface.ts

Result shapes a use case returns when it is more than one entity, e.g.
`AttachmentUpload { attachment: Attachment; upload: SignedUpload }`.

## Errors

- Throw only `DomainError` subclasses from `src/common/errors/domain-error.ts`; never
  `HttpException` or plain `Error`.
- Not allowed to see a resource → `NotFoundError` (don't leak existence). Allowed to see but not
  to change → `AccessDeniedError`. Stale `revision` → `ConflictError`. Invalid document content
  → `ContentInvalidError(issues)`.
- Adding an error kind: code in `ERROR_CODES` (`src/common/errors/error-code.ts`) → subclass
  with that `code` → status in `src/common/filters/exception-resolver.ts` → message in
  `src/i18n/{hy,en,ru}/errors.json`.

## Cross-cutting services you can inject

- `FileStorage` (save, signed upload/download URLs), `ImageProcessor` — global.
- `PdfRendering` (import `RenderingModule`) — `render(printable)` → PDF bytes.
- `Mailer` (import `NotificationsModule`) — `send({ to, template, locale, data })` queues an
  email rendered from a stored template; never build email HTML in code.
- `new Logger(MyUseCase.name)` for logs; request id and user are attached automatically.

Every use case gets a colocated `*.use-case.spec.ts` (see `.claude/rules/testing.md`).
