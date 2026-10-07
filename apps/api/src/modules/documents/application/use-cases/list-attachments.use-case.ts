import { Injectable } from '@nestjs/common';
import type { Principal } from '@common/interfaces/principal.interface';
import type { Attachment } from '../../domain/interfaces/attachment.interface';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class ListAttachments {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
    ) {}

    async execute(principal: Principal, documentId: string): Promise<Attachment[]> {
        const document = await this.access.readable(principal, documentId);
        return this.documents.listAttachments(document.id);
    }
}
