import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import type { Document } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/ports/document.repository';

@Injectable()
export class DocumentAccess {
    constructor(private readonly documents: DocumentRepository) {}

    async readable(principal: Principal, documentId: string): Promise<Document> {
        const document = await this.documents.findById(documentId);
        if (!document?.isReadableBy(principal)) throw new NotFoundError();
        return document;
    }

    async owned(principal: Principal, documentId: string): Promise<Document> {
        const document = await this.documents.findById(documentId);
        if (!document?.isOwnedBy(principal)) throw new NotFoundError();
        return document;
    }
}
