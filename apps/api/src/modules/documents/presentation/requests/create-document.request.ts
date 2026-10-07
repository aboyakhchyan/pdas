import {
    type CreateDocumentInput,
    createDocumentSchema,
    type DocumentContent,
    type Locale,
} from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = createDocumentSchema;

export class CreateDocumentRequest implements CreateDocumentInput {
    @ContractField(shape.templateId)
    templateId: string;

    @ContractField(shape.templateVersion)
    templateVersion?: number;

    @ContractField(shape.title)
    title: string;

    @ContractField(shape.locale)
    locale: Locale;

    @ContractField(shape.content)
    content: DocumentContent;
}
