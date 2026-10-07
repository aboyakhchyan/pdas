import type { DocumentContent, DocumentStatus, Locale } from '@pdas/core';

export interface DocumentProps {
    id: string;
    ownerId: string;
    templateId: string;
    templateVersion: number;
    title: string;
    locale: Locale;
    status: DocumentStatus;
    content: DocumentContent;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
}

export type DocumentSummary = Omit<DocumentProps, 'content'>;

export type NewDocument = Omit<DocumentProps, 'revision' | 'createdAt' | 'updatedAt'>;
