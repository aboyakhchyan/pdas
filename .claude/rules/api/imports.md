---
paths:
    - 'apps/api/**/*.ts'
---

# API import aliases

Use the aliases `@common/*`, `@config/*`, `@infra/*`, `@modules/*`, `@testing/*` (folders of
`apps/api/src`) whenever an import leaves its own top-level area or bounded context. Stay relative
inside one area or context.

```ts
import { NotFoundError } from '@common/errors/domain-error'; // crosses into common → alias
import { GetTemplateVersion } from '@modules/templates/application/services/get-template-version';
import { Document } from '../../domain/entities/document.entity'; // same context → relative
```

Never write `../../../../common/...`. New top-level folder in `src/` → add its alias to
`tsconfig.json` `paths`, the jest `moduleNameMapper` in `package.json` and `apps/api/AGENTS.md`.
