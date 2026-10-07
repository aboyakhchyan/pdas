import { localeSchema } from '@pdas/core';
import { z } from 'zod';
import { firestoreTimestampSchema } from '@infra/firebase/firestore-timestamp.schema';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';

export const mailTemplateRecordSchema = z.object({
    name: z.string(),
    locale: localeSchema,
    subject: z.string(),
    html: z.string(),
    text: z.string().optional(),
    updatedBy: z.string(),
    updatedAt: firestoreTimestampSchema,
});

export const mailTemplateSummaryRecordSchema = mailTemplateRecordSchema.pick({
    name: true,
    locale: true,
    subject: true,
    updatedAt: true,
});

/** The Trigger Email extension looks templates up by document id. */
export function mailTemplateDocumentId({ name, locale }: MailTemplateKey): string {
    return `${name}.${locale}`;
}
