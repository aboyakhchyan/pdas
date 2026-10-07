import { Injectable } from '@nestjs/common';
import {
    type CollectionReference,
    FieldPath,
    Firestore,
    type Query,
    Timestamp,
} from 'firebase-admin/firestore';
import { z } from 'zod';
import { ConflictError, RequestInvalidError } from '@common/errors/domain-error';
import { Document } from '../domain/entities/document.entity';
import type { Attachment } from '../domain/interfaces/attachment.interface';
import type { DocumentPage, PageRequest } from '../domain/interfaces/document-page.interface';
import type { DocumentSummary } from '../domain/interfaces/document.interface';
import { DocumentRepository } from '../domain/ports/document.repository';
import {
    attachmentRecordSchema,
    documentCursorSchema,
    documentRecordSchema,
    documentSummaryRecordSchema,
} from './records/document.record';

const MAX_LISTED_ATTACHMENTS = 100;

@Injectable()
export class FirestoreDocumentRepository extends DocumentRepository {
    private readonly documents: CollectionReference;

    constructor(private readonly firestore: Firestore) {
        super();
        this.documents = firestore.collection('documents');
    }

    async findById(id: string): Promise<Document | null> {
        const snapshot = await this.documents.doc(id).get();
        if (!snapshot.exists) return null;
        return Document.restore({ id, ...documentRecordSchema.parse(snapshot.data()) });
    }

    async create(document: Document): Promise<void> {
        const { id, ...record } = document.toProps();
        await this.documents.doc(id).create(record);
    }

    async update(document: Document, expectedRevision: number): Promise<void> {
        const { id, ...record } = document.toProps();
        const reference = this.documents.doc(id);

        await this.firestore.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(reference);
            if (snapshot.get('revision') !== expectedRevision) throw new ConflictError();
            transaction.set(reference, record);
        });
    }

    async delete(id: string): Promise<void> {
        await this.firestore.recursiveDelete(this.documents.doc(id));
    }

    async listByOwner(ownerId: string, { limit, cursor }: PageRequest): Promise<DocumentPage> {
        let query: Query = this.documents
            .where('ownerId', '==', ownerId)
            .orderBy('updatedAt', 'desc')
            .orderBy(FieldPath.documentId(), 'desc')
            .select(...documentSummaryRecordSchema.keyof().options)
            .limit(limit + 1);

        if (cursor) {
            const position = decodeCursor(cursor);
            query = query.startAfter(Timestamp.fromMillis(position.updatedAt), position.id);
        }

        const snapshot = await query.get();
        const items: DocumentSummary[] = snapshot.docs
            .slice(0, limit)
            .map((doc) => ({ id: doc.id, ...documentSummaryRecordSchema.parse(doc.data()) }));
        const last = items.at(-1);

        return {
            items,
            nextCursor: snapshot.size > limit && last ? encodeCursor(last) : null,
        };
    }

    async addAttachment({ id, documentId, ...record }: Attachment): Promise<void> {
        await this.attachments(documentId).doc(id).create(record);
    }

    async findAttachment(documentId: string, attachmentId: string): Promise<Attachment | null> {
        const snapshot = await this.attachments(documentId).doc(attachmentId).get();
        if (!snapshot.exists) return null;
        return { id: attachmentId, documentId, ...attachmentRecordSchema.parse(snapshot.data()) };
    }

    async listAttachments(documentId: string): Promise<Attachment[]> {
        const snapshot = await this.attachments(documentId)
            .orderBy('createdAt')
            .limit(MAX_LISTED_ATTACHMENTS)
            .get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            documentId,
            ...attachmentRecordSchema.parse(doc.data()),
        }));
    }

    private attachments(documentId: string): CollectionReference {
        return this.documents.doc(documentId).collection('attachments');
    }
}

function encodeCursor({ id, updatedAt }: DocumentSummary): string {
    return Buffer.from(JSON.stringify({ id, updatedAt: updatedAt.getTime() })).toString(
        'base64url',
    );
}

function decodeCursor(cursor: string): z.infer<typeof documentCursorSchema> {
    try {
        return documentCursorSchema.parse(
            JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
        );
    } catch {
        throw new RequestInvalidError([{ path: ['cursor'], message: 'Invalid cursor' }]);
    }
}
