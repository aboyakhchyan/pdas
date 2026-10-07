import { Injectable } from '@nestjs/common';
import type { Principal } from '@common/interfaces/principal.interface';
import { FileStorage } from '@infra/storage/file-storage';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class DeleteDocument {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
        private readonly storage: FileStorage,
    ) {}

    async execute(principal: Principal, documentId: string): Promise<void> {
        const document = await this.access.owned(principal, documentId);
        await this.storage.deleteByPrefix(document.storagePrefix);
        await this.documents.delete(document.id);
    }
}
