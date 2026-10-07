import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import { FileStorage } from '@infra/storage/file-storage';
import type { SignedUrl } from '@infra/storage/interfaces/file-storage.interface';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { DocumentAccess } from '../services/document-access.service';

const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

@Injectable()
export class GetAttachmentDownload {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
        private readonly storage: FileStorage,
    ) {}

    async execute(
        principal: Principal,
        documentId: string,
        attachmentId: string,
    ): Promise<SignedUrl> {
        const document = await this.access.readable(principal, documentId);
        const attachment = await this.documents.findAttachment(document.id, attachmentId);
        if (!attachment || !(await this.storage.exists(attachment.storagePath))) {
            throw new NotFoundError();
        }

        return this.storage.createDownloadUrl({
            path: attachment.storagePath,
            fileName: attachment.fileName,
            expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
        });
    }
}
