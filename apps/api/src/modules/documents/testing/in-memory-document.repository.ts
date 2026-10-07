import { ConflictError } from '@common/errors/domain-error';
import { Document } from '../domain/entities/document.entity';
import type { Attachment } from '../domain/interfaces/attachment.interface';
import type { DocumentPage, PageRequest } from '../domain/interfaces/document-page.interface';
import { DocumentRepository } from '../domain/ports/document.repository';

export class InMemoryDocumentRepository extends DocumentRepository {
    readonly documents = new Map<string, Document>();
    readonly attachments: Attachment[] = [];

    async findById(id: string): Promise<Document | null> {
        const stored = this.documents.get(id);
        return stored ? Document.restore(stored.toProps()) : null;
    }

    async create(document: Document): Promise<void> {
        this.documents.set(document.id, Document.restore(document.toProps()));
    }

    async update(document: Document, expectedRevision: number): Promise<void> {
        if (this.documents.get(document.id)?.revision !== expectedRevision)
            throw new ConflictError();
        this.documents.set(document.id, Document.restore(document.toProps()));
    }

    async delete(id: string): Promise<void> {
        this.documents.delete(id);
    }

    async listByOwner(ownerId: string, { limit }: PageRequest): Promise<DocumentPage> {
        const items = [...this.documents.values()]
            .map((document) => document.toProps())
            .filter((props) => props.ownerId === ownerId)
            .slice(0, limit)
            .map(({ content, ...summary }) => summary);
        return { items, nextCursor: null };
    }

    async addAttachment(attachment: Attachment): Promise<void> {
        this.attachments.push(attachment);
    }

    async findAttachment(documentId: string, attachmentId: string): Promise<Attachment | null> {
        return (
            this.attachments.find((a) => a.documentId === documentId && a.id === attachmentId) ??
            null
        );
    }

    async listAttachments(documentId: string): Promise<Attachment[]> {
        return this.attachments.filter((attachment) => attachment.documentId === documentId);
    }
}
