import type { SignedUpload } from '@infra/storage/interfaces/file-storage.interface';
import type { Attachment } from '../../domain/interfaces/attachment.interface';

export interface AttachmentUpload {
    attachment: Attachment;
    upload: SignedUpload;
}
