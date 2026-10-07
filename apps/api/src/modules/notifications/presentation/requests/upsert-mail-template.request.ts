import { type UpsertMailTemplateInput, upsertMailTemplateSchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = upsertMailTemplateSchema;

export class UpsertMailTemplateRequest implements UpsertMailTemplateInput {
    @ContractField(shape.subject)
    subject: string;

    @ContractField(shape.html)
    html: string;

    @ContractField(shape.text)
    text?: string;
}
