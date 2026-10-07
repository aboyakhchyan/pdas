import { ApiProperty } from '@nestjs/swagger';
import {
    type AttachmentContentType,
    type AttachmentDto,
    attachmentSchema,
    type AttachmentUploadDto,
    attachmentUploadSchema,
} from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const attachment = attachmentSchema.shape;
const upload = attachmentUploadSchema.shape;

export class AttachmentResponse implements AttachmentDto {
    @ContractProperty(attachment.id)
    id: string;

    @ContractProperty(attachment.fileName)
    fileName: string;

    @ContractProperty(attachment.contentType)
    contentType: AttachmentContentType;

    @ContractProperty(attachment.size)
    size: number;

    @ContractProperty(attachment.createdAt)
    createdAt: string;
}

export class AttachmentUploadResponse implements AttachmentUploadDto {
    @ApiProperty({ type: AttachmentResponse })
    attachment: AttachmentResponse;

    @ContractProperty(upload.uploadUrl)
    uploadUrl: string;

    @ContractProperty(upload.uploadHeaders)
    uploadHeaders: Record<string, string>;

    @ContractProperty(upload.expiresAt)
    expiresAt: string;
}
