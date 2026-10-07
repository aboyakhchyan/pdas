import {
    type Blueprint,
    type LocalizedText,
    type PublishTemplateVersionInput,
    publishTemplateVersionSchema,
} from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = publishTemplateVersionSchema;

export class PublishTemplateVersionRequest implements PublishTemplateVersionInput {
    @ContractField(shape.title)
    title: LocalizedText;

    @ContractField(shape.blueprint)
    blueprint: Blueprint;
}
