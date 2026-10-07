import {
    type Blueprint,
    type LocalizedText,
    type TemplateVersionDto,
    templateVersionSchema,
} from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const template = templateVersionSchema.shape;

export class TemplateVersionResponse implements TemplateVersionDto {
    @ContractProperty(template.templateId)
    templateId: string;

    @ContractProperty(template.version)
    version: number;

    @ContractProperty(template.title)
    title: LocalizedText;

    @ContractProperty(template.blueprint)
    blueprint: Blueprint;

    @ContractProperty(template.publishedAt)
    publishedAt: string;

    @ContractProperty(template.publishedBy)
    publishedBy: string;
}
