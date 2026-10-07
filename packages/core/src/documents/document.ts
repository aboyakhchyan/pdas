import { z } from 'zod';
import { localeSchema } from '../constants/locale';
import { templateIdSchema } from '../templates/template';
import { validationIssueSchema } from '../validation/issue';

const MAX_CONTENT_BYTES = 512 * 1024;

export const documentContentSchema = z
    .record(z.string(), z.json())
    .refine(
        (content) =>
            new TextEncoder().encode(JSON.stringify(content)).byteLength <= MAX_CONTENT_BYTES,
        {
            message: `Content must not exceed ${MAX_CONTENT_BYTES} bytes`,
        },
    );
export type DocumentContent = z.infer<typeof documentContentSchema>;

export const DOCUMENT_STATUSES = ['draft', 'ready'] as const;
export const documentStatusSchema = z.enum(DOCUMENT_STATUSES);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const createDocumentSchema = z.object({
    templateId: templateIdSchema,
    templateVersion: z.int().positive().optional(),
    title: z.string().trim().min(1).max(200),
    locale: localeSchema,
    content: documentContentSchema.default({}),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentContentSchema = z.object({
    content: documentContentSchema,
    revision: z.int().min(1),
});
export type UpdateDocumentContentInput = z.infer<typeof updateDocumentContentSchema>;

export const documentSummarySchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    templateId: templateIdSchema,
    templateVersion: z.int().positive(),
    title: z.string(),
    locale: localeSchema,
    status: documentStatusSchema,
    revision: z.int().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type DocumentSummaryDto = z.infer<typeof documentSummarySchema>;

export const documentSchema = documentSummarySchema.extend({ content: documentContentSchema });
export type DocumentDto = z.infer<typeof documentSchema>;

export const listDocumentsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().max(200).optional(),
});
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export const documentPageSchema = z.object({
    items: z.array(documentSummarySchema),
    nextCursor: z.string().nullable(),
});
export type DocumentPageDto = z.infer<typeof documentPageSchema>;

export const documentIdSchema = z.uuid();

export const ATTACHMENT_CONTENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
] as const;
export const attachmentContentTypeSchema = z.enum(ATTACHMENT_CONTENT_TYPES);
export type AttachmentContentType = z.infer<typeof attachmentContentTypeSchema>;
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/** Types accepted by the multipart upload endpoint; images there are re-encoded by the API. */
export const UPLOADABLE_ATTACHMENT_CONTENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
] as const satisfies readonly AttachmentContentType[];

const fileNameSchema = z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[^/\\\p{Cc}]+$/u);

export const requestAttachmentUploadSchema = z.object({
    fileName: fileNameSchema,
    contentType: attachmentContentTypeSchema,
    size: z.int().min(1).max(MAX_ATTACHMENT_BYTES),
});
export type RequestAttachmentUploadInput = z.infer<typeof requestAttachmentUploadSchema>;

export const attachmentSchema = z.object({
    id: z.uuid(),
    fileName: fileNameSchema,
    contentType: attachmentContentTypeSchema,
    size: z.int().positive(),
    createdAt: z.iso.datetime(),
});
export type AttachmentDto = z.infer<typeof attachmentSchema>;

export const attachmentUploadSchema = z.object({
    attachment: attachmentSchema,
    uploadUrl: z.url(),
    uploadHeaders: z.record(z.string(), z.string()),
    expiresAt: z.iso.datetime(),
});
export type AttachmentUploadDto = z.infer<typeof attachmentUploadSchema>;

export const signedDownloadSchema = z.object({ url: z.url(), expiresAt: z.iso.datetime() });
export type SignedDownloadDto = z.infer<typeof signedDownloadSchema>;

export const contentValidationReportSchema = z.object({
    issues: z.array(validationIssueSchema),
    isComplete: z.boolean(),
});
export type ContentValidationReportDto = z.infer<typeof contentValidationReportSchema>;
