import { basename, extname } from 'node:path';
import { Injectable, mixin, type PipeTransform, type Type } from '@nestjs/common';
import { ImageProcessor } from '@infra/image/image-processor';
import type { IncomingFile, UploadRules } from '../interfaces/upload.interface';

const MAX_FILE_NAME_LENGTH = 200;
const UNSAFE_FILE_NAME_CHARACTERS = /[/\\\p{Cc}]/gu;
const FALLBACK_FILE_NAME = 'file';

export function PrepareUploadPipe(rules: UploadRules): Type<PipeTransform> {
    @Injectable()
    class PrepareUpload implements PipeTransform<Express.Multer.File, Promise<IncomingFile>> {
        constructor(private readonly images: ImageProcessor) {}

        async transform(file: Express.Multer.File): Promise<IncomingFile> {
            const fileName = safeFileName(file.originalname);
            if (!rules.image || !file.mimetype.startsWith('image/')) {
                return {
                    fileName,
                    contentType: file.mimetype,
                    size: file.size,
                    buffer: file.buffer,
                };
            }

            const image = await this.images.normalize(file.buffer, rules.image);
            return {
                fileName: withExtension(fileName, image.format),
                contentType: image.contentType,
                size: image.size,
                buffer: image.buffer,
            };
        }
    }
    return mixin(PrepareUpload);
}

function safeFileName(original: string): string {
    const cleaned = basename(original).replace(UNSAFE_FILE_NAME_CHARACTERS, '').trim();
    if (cleaned.length === 0) return FALLBACK_FILE_NAME;
    if (cleaned.length <= MAX_FILE_NAME_LENGTH) return cleaned;

    const extension = extname(cleaned).slice(0, 10);
    return cleaned.slice(0, MAX_FILE_NAME_LENGTH - extension.length) + extension;
}

function withExtension(fileName: string, format: string): string {
    const extension = format === 'jpeg' ? '.jpg' : `.${format}`;
    const stem =
        fileName.slice(0, fileName.length - extname(fileName).length) || FALLBACK_FILE_NAME;
    return `${stem}${extension}`;
}
