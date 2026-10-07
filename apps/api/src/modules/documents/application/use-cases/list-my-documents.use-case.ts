import { Injectable } from '@nestjs/common';
import type { ListDocumentsQuery } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import type { DocumentPage } from '../../domain/interfaces/document-page.interface';
import { DocumentRepository } from '../../domain/ports/document.repository';

@Injectable()
export class ListMyDocuments {
    constructor(private readonly documents: DocumentRepository) {}

    execute(principal: Principal, query: ListDocumentsQuery): Promise<DocumentPage> {
        return this.documents.listByOwner(principal.uid, query);
    }
}
