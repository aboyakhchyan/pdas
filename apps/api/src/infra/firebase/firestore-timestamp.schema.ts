import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

export const firestoreTimestampSchema = z
    .instanceof(Timestamp)
    .transform((timestamp) => timestamp.toDate());
