import type {
    AttachmentDto,
    AttachmentUploadDto,
    DocumentDto,
    DocumentPageDto,
    DocumentSummaryDto,
    SignedDownloadDto,
} from '@pdas/core';
import type { SignedUrl } from '@infra/storage/interfaces/file-storage.interface';
import type { AttachmentUpload } from '../../application/interfaces/attachment-upload.interface';
import type { Document } from '../../domain/entities/document.entity';
import type { Attachment } from '../../domain/interfaces/attachment.interface';
import type { DocumentPage } from '../../domain/interfaces/document-page.interface';
import type { DocumentSummary } from '../../domain/interfaces/document.interface';

export function toDocumentSummaryDto({
    createdAt,
    updatedAt,
    ...summary
}: DocumentSummary): DocumentSummaryDto {
    return { ...summary, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
}

export function toDocumentDto(document: Document): DocumentDto {
    const { content, ...summary } = document.toProps();
    return { ...toDocumentSummaryDto(summary), content };
}

export function toDocumentPageDto({ items, nextCursor }: DocumentPage): DocumentPageDto {
    return { items: items.map(toDocumentSummaryDto), nextCursor };
}

export function toAttachmentDto({
    id,
    fileName,
    contentType,
    size,
    createdAt,
}: Attachment): AttachmentDto {
    return { id, fileName, contentType, size, createdAt: createdAt.toISOString() };
}

export function toAttachmentUploadDto({
    attachment,
    upload,
}: AttachmentUpload): AttachmentUploadDto {
    return {
        attachment: toAttachmentDto(attachment),
        uploadUrl: upload.url,
        uploadHeaders: upload.headers,
        expiresAt: upload.expiresAt.toISOString(),
    };
}

export function toSignedDownloadDto({ url, expiresAt }: SignedUrl): SignedDownloadDto {
    return { url, expiresAt: expiresAt.toISOString() };
}
