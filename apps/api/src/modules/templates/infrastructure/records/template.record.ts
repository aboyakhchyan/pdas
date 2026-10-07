import { localizedTextSchema } from '@pdas/core';
import { z } from 'zod';
import { firestoreTimestampSchema } from '@infra/firebase/firestore-timestamp.schema';

export const templateHeadRecordSchema = z.object({ latestVersion: z.int().positive() });

export const templateVersionRecordSchema = z.object({
    title: localizedTextSchema,
    blueprintJson: z.string(),
    publishedAt: firestoreTimestampSchema,
    publishedBy: z.string(),
});
