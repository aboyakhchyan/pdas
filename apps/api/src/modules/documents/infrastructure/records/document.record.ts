import { attachmentContentTypeSchema, documentStatusSchema, localeSchema } from '@pdas/core';
import { z } from 'zod';
import { firestoreTimestampSchema } from '@infra/firebase/firestore-timestamp.schema';

export const documentSummaryRecordSchema = z.object({
    ownerId: z.string(),
    templateId: z.string(),
    templateVersion: z.int().positive(),
    title: z.string(),
    locale: localeSchema,
    status: documentStatusSchema,
    revision: z.int().positive(),
    createdAt: firestoreTimestampSchema,
    updatedAt: firestoreTimestampSchema,
});

export const documentRecordSchema = documentSummaryRecordSchema.extend({
    content: z.record(z.string(), z.json()),
});

export const attachmentRecordSchema = z.object({
    fileName: z.string(),
    contentType: attachmentContentTypeSchema,
    size: z.int().positive(),
    storagePath: z.string(),
    createdAt: firestoreTimestampSchema,
});

export const documentCursorSchema = z.object({ updatedAt: z.int(), id: z.string() });
