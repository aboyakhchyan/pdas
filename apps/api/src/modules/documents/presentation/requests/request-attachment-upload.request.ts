import {
    type AttachmentContentType,
    type RequestAttachmentUploadInput,
    requestAttachmentUploadSchema,
} from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = requestAttachmentUploadSchema;

export class RequestAttachmentUploadRequest implements RequestAttachmentUploadInput {
    @ContractField(shape.fileName)
    fileName: string;

    @ContractField(shape.contentType)
    contentType: AttachmentContentType;

    @ContractField(shape.size)
    size: number;
}
