import { ConflictError } from '@common/errors/domain-error';

const MAX_ATTACHMENTS_PER_DOCUMENT = 20;

export function ensureAttachmentCapacity(existingAttachments: number): void {
    if (existingAttachments >= MAX_ATTACHMENTS_PER_DOCUMENT) throw new ConflictError();
}
