import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { RequestInvalidError } from '../errors/domain-error';
import type { UploadRules } from '../interfaces/upload.interface';

/**
 * Requires the file and checks its size and real type: the type is detected from the content
 * (magic numbers) and replaces the client-provided MIME type.
 */
export function fileValidationPipe({ field, maxBytes, contentTypes }: UploadRules): ParseFilePipe {
    return new ParseFilePipe({
        fileIsRequired: true,
        validators: [
            new MaxFileSizeValidator({ maxSize: maxBytes }),
            new FileTypeValidator({ fileType: anyOf(contentTypes), overrideMimeType: true }),
        ],
        exceptionFactory: (message) => new RequestInvalidError([{ path: [field], message }]),
    });
}

function anyOf(contentTypes: readonly string[]): RegExp {
    const escaped = contentTypes.map((type) => type.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
    return new RegExp(`^(${escaped.join('|')})$`);
}
