import { applyDecorators, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiPayloadTooLargeResponse } from '@nestjs/swagger';
import type { UploadRules } from '../interfaces/upload.interface';
import { fileValidationPipe } from '../pipes/file-validation.pipe';
import { PrepareUploadPipe } from '../pipes/prepare-upload.pipe';
import { ErrorResponse } from '../responses/error.response';

/**
 * Accepts a single-file `multipart/form-data` request. The file is kept in memory and capped
 * by size at the parser level, before any validation runs. Pair with `@IncomingUpload(rules)`.
 */
export function FileUpload(rules: UploadRules): MethodDecorator {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor(rules.field, {
                limits: { fileSize: rules.maxBytes, files: 1, fields: 0, parts: 1 },
                defParamCharset: 'utf8',
            }),
        ),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                required: [rules.field],
                properties: {
                    [rules.field]: {
                        type: 'string',
                        format: 'binary',
                        description: `${rules.contentTypes.join(', ')}; up to ${rules.maxBytes} bytes`,
                    },
                },
            },
        }),
        ApiPayloadTooLargeResponse({ type: ErrorResponse }),
    );
}

/** Injects the uploaded file validated against `rules` and prepared as an `IncomingFile`. */
export function IncomingUpload(rules: UploadRules): ParameterDecorator {
    return UploadedFile(fileValidationPipe(rules), PrepareUploadPipe(rules));
}
