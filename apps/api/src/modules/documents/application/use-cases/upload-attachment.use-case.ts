import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { attachmentContentTypeSchema } from '@pdas/core';
import { UnsupportedMediaTypeError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import type { IncomingFile } from '@common/interfaces/upload.interface';
import { FileStorage } from '@infra/storage/file-storage';
import { ensureAttachmentCapacity } from '../../domain/attachment-capacity';
import type { Attachment } from '../../domain/interfaces/attachment.interface';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class UploadAttachment {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
        private readonly storage: FileStorage,
    ) {}

    async execute(
        principal: Principal,
        documentId: string,
        file: IncomingFile,
    ): Promise<Attachment> {
        const contentType = attachmentContentTypeSchema.safeParse(file.contentType);
        if (!contentType.success) throw new UnsupportedMediaTypeError();

        const document = await this.access.owned(principal, documentId);
        ensureAttachmentCapacity((await this.documents.listAttachments(document.id)).length);

        const id = randomUUID();
        const attachment: Attachment = {
            id,
            documentId: document.id,
            fileName: file.fileName,
            contentType: contentType.data,
            size: file.size,
            storagePath: document.attachmentPath(id),
            createdAt: new Date(),
        };

        await this.storage.save({
            path: attachment.storagePath,
            contentType: attachment.contentType,
            data: file.buffer,
        });
        await this.documents.addAttachment(attachment);
        return attachment;
    }
}
