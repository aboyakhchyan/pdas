import { Injectable } from '@nestjs/common';
import type { Principal } from '@common/interfaces/principal.interface';
import type { Document } from '../../domain/entities/document.entity';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class GetDocument {
    constructor(private readonly access: DocumentAccess) {}

    execute(principal: Principal, documentId: string): Promise<Document> {
        return this.access.readable(principal, documentId);
    }
}
