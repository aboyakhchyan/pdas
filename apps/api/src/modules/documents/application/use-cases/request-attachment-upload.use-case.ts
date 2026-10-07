import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RequestAttachmentUploadInput } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import { FileStorage } from '@infra/storage/file-storage';
import { ensureAttachmentCapacity } from '../../domain/attachment-capacity';
import type { Attachment } from '../../domain/interfaces/attachment.interface';
import { DocumentRepository } from '../../domain/ports/document.repository';
import type { AttachmentUpload } from '../interfaces/attachment-upload.interface';
import { DocumentAccess } from '../services/document-access.service';

const UPLOAD_URL_TTL_SECONDS = 15 * 60;

@Injectable()
export class RequestAttachmentUpload {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
        private readonly storage: FileStorage,
    ) {}

    async execute(
        principal: Principal,
        documentId: string,
        input: RequestAttachmentUploadInput,
    ): Promise<AttachmentUpload> {
        const document = await this.access.owned(principal, documentId);
        const existing = await this.documents.listAttachments(document.id);
        ensureAttachmentCapacity(existing.length);

        const id = randomUUID();
        const attachment: Attachment = {
            id,
            documentId: document.id,
            ...input,
            storagePath: document.attachmentPath(id),
            createdAt: new Date(),
        };
        const upload = await this.storage.createUploadUrl({
            path: attachment.storagePath,
            contentType: attachment.contentType,
            maxBytes: attachment.size,
            expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
        });

        await this.documents.addAttachment(attachment);
        return { attachment, upload };
    }
}
