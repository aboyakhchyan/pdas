import { authProviderSchema, localeSchema, roleSchema } from '@pdas/core';
import { z } from 'zod';
import { firestoreTimestampSchema } from '@infra/firebase/firestore-timestamp.schema';

export const userRecordSchema = z.object({
    email: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    displayName: z.string().nullable(),
    photoUrl: z.string().nullable(),
    role: roleSchema,
    locale: localeSchema,
    providers: z.array(authProviderSchema),
    createdAt: firestoreTimestampSchema,
    updatedAt: firestoreTimestampSchema,
});
