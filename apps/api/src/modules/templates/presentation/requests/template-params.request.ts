import { templateIdSchema } from '@pdas/core';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ContractField } from '@common/decorators/contract.decorator';

export class TemplateParams {
    @ContractField(templateIdSchema)
    templateId: string;
}

export class TemplateVersionParams extends TemplateParams {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    version: number;
}
