# apps/api — NestJS 12 (api.pdas.am)

Modular monolith built from DDD bounded contexts. Each context is a Nest module that could later
be extracted into its own service. The `documents` context is the reference implementation —
when unsure how something is done, copy its shape.

## Layout

```
src/
  main.ts                    config (fails fast), logger, request context, JSON parser, CORS, `/v1`, Swagger `/docs`
  app.module.ts              AppModule.forRoot(configuration): global filter + validation pipe, every module
  config/
    env.schema.ts            the only place that knows raw env names (UPPER_CASE, zod)
    configuration.ts         loadConfiguration(): validates env, maps it to camelCase namespaces
    interfaces/              Configuration, AppConfig, FirebaseConfig, LoggingConfig, MailConfig, Env
  common/                    cross-cutting, no business logic
    context/                 RequestContext (AsyncLocalStorage: requestId, uid)
    decorators/              @Auth, @Public, @CurrentPrincipal, @ContractField, @ContractProperty,
                             @FileUpload, @IncomingUpload, @RequirePermissions (used by @Auth)
    errors/                  ERROR_CODES, DomainError and its subclasses
    filters/                 AllExceptionsFilter + exception-resolver (anything thrown → ErrorResponse)
    interfaces/              Principal, RequestIssue, UploadRules, IncomingFile, ...
    middleware/              requestContextMiddleware (X-Request-Id)
    pipes/                   RequestValidationPipe (global), file-validation, prepare-upload
    responses/               ErrorResponse (Swagger shape of every error)
  infra/                     shared adapters used by several contexts (global modules)
    firebase/                FirebaseModule (Firestore, Auth, Storage), firestoreTimestampSchema
    storage/                 FileStorage port + FirebaseFileStorage adapter
    logging/                 AppLogger (stdout + LogSink), FirestoreLogSink (batched, TTL)
    image/                   ImageProcessor port + SharpImageProcessor
    i18n/                    I18nConfigModule
  i18n/<locale>/*.json       nestjs-i18n translations (hy/en/ru): common, errors, pdf
  modules/<context>/         identity, validation, templates, documents, rendering, notifications, health
  testing/                   shared test helpers (principalOf, InMemoryFileStorage)
```

## Bounded context layout

```
src/modules/<context>/
  domain/
    entities/        <name>.entity.ts        classes with behaviour (private ctor, create/restore/toProps)
    interfaces/      <name>.interface.ts     props and value shapes of this context
    ports/           <name>.repository.ts    abstract class — persistence port, also the DI token
                     <name>.port.ts          abstract class — any other outbound port (identity, PDF, mail outbox)
    <rule>.ts                                pure domain functions and rules (attachment-capacity.ts)
  application/
    use-cases/       <verb-noun>.use-case.ts + <verb-noun>.use-case.spec.ts
    services/        <name>.service.ts       shared within the context or exported to other contexts
    interfaces/      <name>.interface.ts     results returned by use cases / services
  infrastructure/
    firestore-<name>.repository.ts           adapter implementing a repository port
    <vendor>-<name>.<kind>.ts                adapter implementing a *.port.ts (firebase-identity.provider.ts,
                                             pdfmake-pdf-renderer.ts, firestore-mail-outbox.ts)
    records/         <name>.record.ts        zod schemas of stored Firestore records
  presentation/
    controllers/     <name>.controller.ts    thin HTTP layer
    requests/        <name>.request.ts       request DTO classes (body, query, params)
    responses/       <name>.response.ts      response DTO classes (Swagger / generated client)
    guards/          <name>.guard.ts
    presenters/      <name>.presenter.ts     pure functions domain → DTO type from @pdas/core
  testing/           in-memory-<name>.repository.ts, <context>-fixture.ts, <name>.blueprint.ts
  <context>.module.ts
```

Create only the folders a context needs (`validation` has no infrastructure, `health` only has
presentation). Never create files outside this structure inside a context.

## Import aliases

Path aliases (`tsconfig.json` `paths`, mirrored in the jest `moduleNameMapper`; `nest build`
rewrites them): `@common/*`, `@config/*`, `@infra/*`, `@modules/*`, `@testing/*` → the same-named
folder in `src/`.

- Crossing a top-level area (into `common`, `config`, `infra`, `testing`, or another context) →
  always the alias: `@common/errors/domain-error`, `@infra/firebase/firestore-timestamp.schema`.
  Never `../../../../common/...`.
- Inside one area or one context → relative (`./x`, `../domain/...`), so a context can be moved
  or renamed without touching its own files.
- Another context is reached as `@modules/<context>/application/...` and only through its
  exported application class (see Layer rules).
- A new top-level folder in `src/` needs its alias added in three places: `tsconfig.json`,
  the jest `moduleNameMapper` in `package.json`, and this section.

## Where does it go?

| You are writing                                     | Put it in                                                       |
| --------------------------------------------------- | --------------------------------------------------------------- |
| Request/response contract, enum shared with clients | `packages/core/src/<context>/` (zod) + export from `index.ts`   |
| Request DTO class (validation)                      | `<context>/presentation/requests/<name>.request.ts`             |
| Response DTO class (Swagger)                        | `<context>/presentation/responses/<name>.response.ts`           |
| Props / value shape of one context                  | `<context>/domain/interfaces/<name>.interface.ts`               |
| Result type of a use case                           | `<context>/application/interfaces/<name>.interface.ts`          |
| Persistence contract                                | `<context>/domain/ports/<name>.repository.ts` (abstract class)  |
| Other outbound contract (auth, AI, PDF, email)      | `<context>/domain/ports/<name>.port.ts` (abstract class)        |
| Firestore/Firebase/vendor code                      | `<context>/infrastructure/` only                                |
| Shape of a stored Firestore document                | `<context>/infrastructure/records/<name>.record.ts` (zod)       |
| Type used by every context                          | `src/common/interfaces/<name>.interface.ts`                     |
| Reusable decorator / pipe / middleware              | `src/common/decorators/`, `pipes/`, `middleware/`               |
| New error kind                                      | `src/common/errors/` + resolver + all 3 `errors.json`           |
| Adapter shared by several contexts                  | `src/infra/<name>/` as a `@Global()` module exporting the port  |
| Config value                                        | `config/env.schema.ts` → `configuration.ts` → `interfaces/`     |
| Upload limits of one endpoint                       | `const <NAME>_UPLOAD: UploadRules` at the top of the controller |
| Helper used by one file                             | private function at the bottom of that file                     |
| Constant used by one file                           | `const UPPER_CASE` at the top of that file                      |
| In-memory fake / fixture                            | `<context>/testing/` (or `src/testing/` if shared)              |

Private aliases of an SDK type stay inside their adapter file. There is no `utils/`, `helpers/`,
`constants/`, `types/` or `dto/` folder in the API — do not create one.

## Naming

- Use case class = imperative verb phrase, no suffix: `CreateDocument`, `AssignRole`,
  `ListMyDocuments`. One public method: `execute(...)`. Actor first when there is one:
  `execute(principal, documentId, input)`.
- Application service class = noun without `Service` when it reads well (`DocumentAccess`,
  `Mailer`, `PdfRendering`), otherwise `<Name>Service` (`ContentValidationService`).
- Ports: `DocumentRepository`, `IdentityProvider`, `FileStorage`, `PdfRenderer`, `MailOutbox`.
  Adapters prefix the technology: `FirestoreDocumentRepository`, `FirebaseIdentityProvider`,
  `PdfmakePdfRenderer`, `SharpImageProcessor`. Fakes prefix `InMemory`.
- Request classes: `<Action><Entity>Request` (`CreateDocumentRequest`), query
  `List<Entities>Request`, route params `<Entity>Params`. Response classes: `<Entity>Response`.
  Each `implements` the matching type from `@pdas/core`.
- Props `<Entity>Props`; creation input `New<Entity>`; partial update `<Entity>Changes`; list
  projection `<Entity>Summary`; page `<Entity>Page`.
- Zod record schemas: `<name>RecordSchema`. Presenters: `to<Name>Dto`.
- Injected dependencies are named by role, not by class: `documents: DocumentRepository`,
  `templates: GetTemplateVersion`, `rendering: PdfRendering`.

## Layer rules

- Dependencies point inward: presentation → application → domain ← infrastructure.
- `domain` imports only `@pdas/core`, `src/common/interfaces` and `src/common/errors`. No
  `@nestjs/*`, no `firebase-admin`, no SDKs, no HTTP.
- Ports are abstract classes (not interfaces + symbols) so they work as DI tokens. They are bound
  in `<context>.module.ts`: `{ provide: DocumentRepository, useClass: FirestoreDocumentRepository }`.
- Use cases and services are `@Injectable()`, depend on ports and other contexts' exported
  application classes — never on adapters, Firestore or `ConfigService` directly. They never see
  HTTP types: uploads arrive as `IncomingFile`, not `Express.Multer.File`.
- Time is created once per use case (`new Date()`) and passed to the entity as `now`; IDs come
  from `randomUUID()` in the use case.
- Another context is reached only through its exported application class (listed in that
  module's `exports`, e.g. `GetTemplateVersion`, `PdfRendering`, `Mailer`) or a domain event.
  Types in that class's signature may be imported; ports, adapters and records may not.
- Optimistic concurrency: entities carry `revision`; updates pass `expectedRevision` and the
  adapter throws `ConflictError` on mismatch inside a transaction.

## Validation (class-validator + zod contracts)

- The global `RequestValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) validates
  every `@Body()`, `@Query()` and `@Param()` typed with a request class and throws
  `RequestInvalidError` with `issues[{ path, message }]`.
- Request classes declare each property with `@ContractField(<coreSchema>.shape.<field>)`: the
  zod field from `@pdas/core` validates, normalizes (trim, coerce, default) and documents it in
  Swagger, so limits are never duplicated. Use plain class-validator decorators
  (`@IsUUID()`, `@Type(() => Number) @IsInt() @Min(1)`) only where no contract exists.
- Response classes use `@ContractProperty(<coreSchema>.shape.<field>)`; nested classes via
  `@ApiProperty({ type: NestedResponse })`. Controllers declare them in `@Api*Response({ type })`.
- Content validated against a template blueprint stays in `ContentValidationService`.

## Errors

- Use cases throw `DomainError` subclasses (`NotFoundError`, `AccessDeniedError`,
  `ConflictError`, `UnsupportedMediaTypeError`, `ContentInvalidError`, `RequestInvalidError`,
  `UnauthenticatedError`). Never throw Nest `HttpException`s or plain `Error`s for expected cases.
- `AllExceptionsFilter` catches everything. `exception-resolver.ts` maps domain errors, Nest HTTP
  exceptions (404 route, 413 multer), body-parser errors, Firestore gRPC codes (ABORTED/ALREADY_
  EXISTS → 409, UNAVAILABLE → 503 + `Retry-After`, DEADLINE_EXCEEDED → 504) and Cloud Storage
  errors to a status + `ErrorCode`; unknown errors become 500 `internal` without leaking details.
- Every response error has the `ErrorResponse` shape: `statusCode`, `code`, translated `message`,
  optional `issues`, `requestId`, `path`, `timestamp`. 5xx are logged with stack, 4xx at debug.
- A new error code needs: `ERROR_CODES`, a resolver mapping and a message in
  `src/i18n/{hy,en,ru}/errors.json` (a spec fails if a translation is missing).

## Auth and roles

- Roles: `user`, `admin`, `super-admin` (Firebase custom claim `role`). Permissions per role in
  `ROLE_PERMISSIONS` (`packages/core/src/identity/access.ts`); only `super-admin` can assign roles.
- `AuthenticationGuard` is global: every route is private unless `@Public()`. Mark private
  endpoints with `@Auth('<permission>', ...)` (permission check + Swagger bearer/401/403). Check
  permissions, never role names.
- Ownership is checked in the use case/service, not the controller. A resource the principal may
  not read is reported as `NotFoundError` (don't leak existence) — see `DocumentAccess`.

## Logging

- Use `private readonly logger = new Logger(MyClass.name)` from `@nestjs/common`; it routes to
  `AppLogger`, which prints to stdout (JSON in production) and persists the levels in
  `LOG_PERSIST_LEVELS` to the Firestore `logs` collection in batches, expiring after
  `LOG_RETENTION_DAYS` (TTL on `expiresAt`). Every entry carries `requestId` and `uid`.
- Never log secrets, tokens, document content or personal data; log ids instead.

## Files and images

- Endpoint receives a file with `@FileUpload(RULES)` on the handler and
  `@IncomingUpload(RULES) file: IncomingFile` on the parameter. Rules: multipart field, max bytes,
  allowed MIME types (checked by magic numbers, not the header) and optional `image` rules.
- With `image` rules, sharp auto-rotates, strips EXIF/GPS, fits into the bounds and re-encodes.
- Store bytes through `FileStorage.save`; large client uploads go straight to Storage through
  signed URLs (`createUploadUrl`) instead of through the API.

## PDF (rendering context)

- Output documents are PDF only. Callers build a layout-free `PrintableDocument` (headings and
  label/value fields) and call `PdfRendering.render()`; `PdfmakePdfRenderer` lays it out with
  pdfmake and the DejaVu Serif font (Armenian + Latin + Cyrillic). Format money with
  `currencyDisplay: 'code'` — the font has no ֏ glyph.
- `GetDocumentPdf` renders once per document revision and caches the file in Storage.
- PDF rendering, AI generation and other slow work move to a queue (BullMQ on Redis) once they
  stop being fast; AI goes through an `AiProvider` port — not integrated until asked.

## Email (notifications context)

- Send with the exported `Mailer`: `mailer.send({ to, template, locale, data })`. It queues a
  document in the `mail` collection; the Firebase Trigger Email extension renders the Handlebars
  template from `mailTemplates/<name>.<locale>` (falls back to `hy`), sends and retries.
- Admins edit templates through `/mail-templates` (permission `mail-templates:manage`) without a
  deploy. Template names are kebab-case; every template needs hy, en and ru translations.

## Persistence (Firestore)

- Each adapter owns its collection: `firestore.collection('<plural>')` set in the constructor.
- Parse every read with the record schema; map `Timestamp` → `Date` with
  `firestoreTimestampSchema`. The domain never sees Firestore types.
- The document ID is the entity `id` and is not stored inside the record.
- `create()` for inserts, `set()` for upserts, transactions for read-modify-write,
  `recursiveDelete` for documents with subcollections.
- Every new query needs an index in `infrastructure/firebase/firestore.indexes.json`; exempt
  large fields from indexing. Paginate with `limit + 1` and an opaque cursor; bound every list.

## Config

- Read config as camelCase namespaces: `config.get('mail', { infer: true })`; never read
  `process.env` or raw env names outside `src/config/`. New env var → `env.schema.ts`,
  `configuration.ts`, `config/interfaces/`, `apps/api/.env.example`, compose files.
- i18n for text the API generates via `nestjs-i18n` (`I18nService`). Locale comes from `?lang=`,
  `X-Lang`, or `Accept-Language`, falling back to `DEFAULT_LOCALE`.

## Code templates per layer

Concrete templates live in `.claude/rules/api/` at the repo root (shared by all agents; Claude
Code loads them automatically by path). Read the matching file before writing code in a layer:
`domain.md`, `application.md`, `infrastructure.md`, `presentation.md`, `config.md`, `imports.md` (path aliases),
and `.claude/rules/testing.md` for specs.

## Commands

- `pnpm dev:api` · `pnpm --filter @pdas/api test` · `pnpm --filter @pdas/api typecheck` ·
  `pnpm --filter @pdas/api lint`
- Tests need Node 24 (Nest 12 is ESM-only; Jest loads it via `require(esm)`).
