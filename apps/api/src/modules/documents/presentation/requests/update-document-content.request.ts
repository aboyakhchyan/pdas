import {
    type DocumentContent,
    type UpdateDocumentContentInput,
    updateDocumentContentSchema,
} from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = updateDocumentContentSchema;

export class UpdateDocumentContentRequest implements UpdateDocumentContentInput {
    @ContractField(shape.content)
    content: DocumentContent;

    @ContractField(shape.revision)
    revision: number;
}
