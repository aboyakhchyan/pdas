import type { Document } from '../entities/document.entity';
import type { Attachment } from '../interfaces/attachment.interface';
import type { DocumentPage, PageRequest } from '../interfaces/document-page.interface';

export abstract class DocumentRepository {
    abstract findById(id: string): Promise<Document | null>;
    abstract create(document: Document): Promise<void>;
    abstract update(document: Document, expectedRevision: number): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract listByOwner(ownerId: string, page: PageRequest): Promise<DocumentPage>;
    abstract addAttachment(attachment: Attachment): Promise<void>;
    abstract findAttachment(documentId: string, attachmentId: string): Promise<Attachment | null>;
    abstract listAttachments(documentId: string): Promise<Attachment[]>;
}
