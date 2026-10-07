import type { AttachmentContentType } from '@pdas/core';

export interface Attachment {
    id: string;
    documentId: string;
    fileName: string;
    contentType: AttachmentContentType;
    size: number;
    storagePath: string;
    createdAt: Date;
}
