import {
    type Locale,
    type MailTemplateDto,
    mailTemplateSchema,
    type MailTemplateSummaryDto,
} from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const template = mailTemplateSchema.shape;

export class MailTemplateSummaryResponse implements MailTemplateSummaryDto {
    @ContractProperty(template.name)
    name: string;

    @ContractProperty(template.locale)
    locale: Locale;

    @ContractProperty(template.subject)
    subject: string;

    @ContractProperty(template.updatedAt)
    updatedAt: string;
}

export class MailTemplateResponse extends MailTemplateSummaryResponse implements MailTemplateDto {
    @ContractProperty(template.html)
    html: string;

    @ContractProperty(template.text)
    text: string | null;

    @ContractProperty(template.updatedBy)
    updatedBy: string;
}
