import { documentIdSchema } from '@pdas/core';
import { IsUUID } from 'class-validator';
import { ContractField } from '@common/decorators/contract.decorator';

export class DocumentParams {
    @ContractField(documentIdSchema)
    documentId: string;
}

export class AttachmentParams extends DocumentParams {
    @IsUUID()
    attachmentId: string;
}
