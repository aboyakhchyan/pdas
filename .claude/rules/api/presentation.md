---
paths:
    - 'apps/api/src/modules/*/presentation/**/*.ts'
    - 'apps/api/src/modules/*/*.module.ts'
    - 'apps/api/src/app.module.ts'
---

# API presentation layer and module wiring

Validation = class-validator DTO classes + zod contracts from `@pdas/core`, wired by decorators.
The global `RequestValidationPipe` validates every `@Body()`, `@Query()`, `@Param()` typed with a
request class (whitelist + forbidNonWhitelisted + transform). Never validate by hand in handlers.

## presentation/requests/<name>.request.ts

```ts
import {
    type CreateLegalSourceInput,
    createLegalSourceSchema,
    legalSourceIdSchema,
    type Locale,
} from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = createLegalSourceSchema;

export class CreateLegalSourceRequest implements CreateLegalSourceInput {
    @ContractField(shape.title)
    title: string;

    @ContractField(shape.locale)
    locale: Locale;

    @ContractField(shape.url)
    url: string;
}

export class LegalSourceParams {
    @ContractField(legalSourceIdSchema)
    legalSourceId: string;
}
```

- `implements <Input>` from `@pdas/core`: the compiler fails if the class drifts from the contract.
- `@ContractField(schema.shape.field)` on every property: the zod field validates, normalizes
  (trim/coerce/default) and documents it in Swagger. Limits are never repeated in the API.
- Only where no contract exists, use class-validator / class-transformer directly:
  `@IsUUID()`, `@Type(() => Number) @IsInt() @Min(1)`.
- Route params are a `<Entity>Params` class used as `@Param() { legalSourceId }: LegalSourceParams`.

## presentation/responses/<name>.response.ts

```ts
export class LegalSourceResponse implements LegalSourceDto {
    @ContractProperty(legalSourceSchema.shape.id)
    id: string;

    @ContractProperty(legalSourceSchema.shape.title)
    title: string;

    @ApiProperty({ type: [LegalActResponse] })
    acts: LegalActResponse[];
}
```

Documentation only (Swagger → `pnpm gen:api` client). Nested objects that have their own class
use `@ApiProperty({ type: NestedResponse })`.

## presentation/controllers/<name>.controller.ts

```ts
const SCAN_UPLOAD: UploadRules = {
    field: 'file',
    maxBytes: MAX_SCAN_BYTES,
    contentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    image: { maxWidth: 3000, maxHeight: 3000 },
};

@ApiTags('legal-sources')
@Controller('legal-sources')
export class LegalSourcesController {
    constructor(
        private readonly createLegalSource: CreateLegalSource,
        private readonly getLegalSource: GetLegalSource,
        private readonly attachScan: AttachScan,
    ) {}

    @Post()
    @Auth('legal-sources:manage')
    @ApiOperation({ summary: 'Register a legal act from hartak.am or moj.gov.am' })
    @ApiCreatedResponse({ type: LegalSourceResponse })
    async create(
        @CurrentPrincipal() principal: Principal,
        @Body() input: CreateLegalSourceRequest,
    ): Promise<LegalSourceDto> {
        return toLegalSourceDto(await this.createLegalSource.execute(principal, input));
    }

    @Get(':legalSourceId')
    @Public()
    @ApiOperation({ summary: 'A legal source with its metadata' })
    @ApiOkResponse({ type: LegalSourceResponse })
    async get(@Param() { legalSourceId }: LegalSourceParams): Promise<LegalSourceDto> {
        return toLegalSourceDto(await this.getLegalSource.execute(legalSourceId));
    }

    @Post(':legalSourceId/scan')
    @Auth('legal-sources:manage')
    @FileUpload(SCAN_UPLOAD)
    @ApiOperation({ summary: 'Attach the official scan' })
    @ApiCreatedResponse({ type: LegalSourceResponse })
    async scan(
        @Param() { legalSourceId }: LegalSourceParams,
        @IncomingUpload(SCAN_UPLOAD) file: IncomingFile,
    ): Promise<LegalSourceDto> {
        return toLegalSourceDto(await this.attachScan.execute(legalSourceId, file));
    }
}
```

- Each handler: typed request classes → one use case → presenter. No `if`s, no repositories, no
  try/catch (`AllExceptionsFilter` turns every error into `ErrorResponse`).
- Private endpoints: `@Auth('<permission>', ...)` — checks permissions and adds Swagger bearer,
  401 and 403. New permissions (`<kebab-resource>:<action>`) go into `PERMISSIONS` and
  `ROLE_PERMISSIONS` in `packages/core/src/identity/access.ts`. Public endpoints: `@Public()`.
  `@Auth` on the controller class applies to every handler.
- Files: `@FileUpload(RULES)` + `@IncomingUpload(RULES) file: IncomingFile`; the rules constant
  sits at the top of the controller. The use case receives `IncomingFile`, never multer types.
- Swagger on every handler: `@ApiOperation({ summary })` + `@Api*Response({ type: XResponse })`;
  controller has `@ApiTags('<kebab-plural>')`.
- Route segments are kebab-case plural nouns; params are `:<entity>Id`. `DELETE` returns
  `@HttpCode(HttpStatus.NO_CONTENT)` + `@ApiNoContentResponse()`.
- Return type is the DTO type from `@pdas/core`; the response class is only for Swagger.

## presentation/presenters/<name>.presenter.ts

```ts
export function toLegalSourceDto(source: LegalSource): LegalSourceDto {
    const { createdAt, updatedAt, ...props } = source.toProps();
    return { ...props, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
}
```

Pure exported functions `to<Name>Dto`; `Date` → ISO string; drop internal fields (storage paths,
`ownerId` when the client should not see it).

## presentation/guards/<name>.guard.ts

Only for cross-cutting request checks owned by the context (identity owns the global
authentication/authorization guards). Guards throw `DomainError`s, not `HttpException`s.

## <context>.module.ts

```ts
@Module({
    imports: [TemplatesModule],
    controllers: [LegalSourcesController],
    providers: [
        CreateLegalSource,
        GetLegalSource,
        { provide: LegalSourceRepository, useClass: FirestoreLegalSourceRepository },
    ],
    exports: [GetLegalSource],
})
export class LegalSourcesModule {}
```

- Providers: every use case and service, then port bindings `{ provide: Port, useClass: Adapter }`.
- `exports` only application classes other contexts may call — never repositories or adapters.
- `imports` only other context modules whose exported classes you inject; `FirebaseModule`,
  `StorageModule`, `LoggingModule`, `ImageModule` and `ConfigModule` are global.
- Register the module in `AppModule.forRoot` imports in `src/app.module.ts`.
