---
paths:
    - 'packages/core/src/**/*.ts'
---

# packages/core — API contracts

The single source of truth for everything that crosses the wire between api, web, admin and
mobile. Framework-free: only `zod` and plain TypeScript.

- One folder per bounded context (`documents/`, `identity/`, `templates/`, `validation/`), plus
  `constants/` for cross-context values that are part of the contract (`locale`, `money`) and
  `i18n/` for shared translation utilities. Every file is re-exported from `src/index.ts`.
- Define the schema, then infer the type next to it — never hand-write a type that duplicates a
  schema:

```ts
export const createDocumentSchema = z.object({
    templateId: templateIdSchema,
    title: z.string().trim().min(1).max(200),
    locale: localeSchema,
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
```

- Naming: `<action><Entity>Schema` + `<Action><Entity>Input` for request bodies,
  `<entity>Schema` + `<Entity>Dto` for responses, `<entity>IdSchema` for route params,
  `list<Entities>QuerySchema` + `List<Entities>Query` for query strings.
- Enums: `export const DOCUMENT_STATUSES = [...] as const;` →
  `documentStatusSchema = z.enum(DOCUMENT_STATUSES)` → `type DocumentStatus`.
- Dates in DTOs are ISO strings; IDs are validated (`z.uuid()` or a strict regex) so they are safe
  in Firestore paths; every string and array has a max length.
- Money is `Money` (integer minor units + currency). Localized text is `localizedTextSchema`
  (hy, en, ru).
- Limits that are part of the contract are a `const` at the top of the file that uses them
  (`MAX_CONTENT_BYTES`), not a shared constants file.
- Roles and permissions live in `identity/access.ts` (`PERMISSIONS`, `ROLE_PERMISSIONS`).
- After a contract change: update the API controller/presenter, then run `pnpm gen:api` (API
  must be running) so `packages/api-client` and the clients pick it up.
- Keep changes backward compatible for mobile clients already in stores: add optional fields,
  don't rename or remove without a versioned endpoint.
